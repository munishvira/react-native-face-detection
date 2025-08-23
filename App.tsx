import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Camera, useCameraDevice } from 'react-native-vision-camera';
import {
  Camera as FaceCamera,
  Face,
  FaceDetectionOptions,
} from 'react-native-vision-camera-face-detector';

export default function App() {
  const device = useCameraDevice('front');
  const [status, setStatus] = useState('Monitoring...');

  useEffect(() => {
    // (Safe) ensure permission is granted
    Camera.requestCameraPermission();
  }, []);

  const faceDetectionOptions = useRef<FaceDetectionOptions>({
    performanceMode: 'accurate',
    landmarkMode: 'all',
    contourMode: 'all',
    classificationMode: 'all', // eyeOpenProbability
  }).current;

  // Frame counters
  const closedEyeFrames = useRef(0);
  const distractedFrames = useRef(0);
  const talkingFrames = useRef(0);
  const yawningFrames = useRef(0);

  // Mouth dynamics (to separate talking vs yawning)
  const lipHistory = useRef<number[]>([]);
  const openHistory = useRef<number[]>([]); // 1=open, 0=closed
  const MAX_HISTORY = 20; // ~0.6s @ ~30fps

  // Distances
  const distance = (p1: any, p2: any) =>
    Math.hypot((p1?.x ?? 0) - (p2?.x ?? 0), (p1?.y ?? 0) - (p2?.y ?? 0));

  // Central point from a contour array
  const midPoint = (pts: any[]) =>
    pts && pts.length ? pts[Math.floor(pts.length / 2)] : null;

  // Calculate normalized lip opening using ONLY contours:
  // vertical gap = midpoint(UPPER_LIP_BOTTOM) <-> midpoint(LOWER_LIP_TOP)
  // width       = distance(leftmost point, rightmost point) across both lips
  const calcLipOpenRatio = (contours: any) => {
    const upperArr = contours?.UPPER_LIP_BOTTOM || [];
    const lowerArr = contours?.LOWER_LIP_TOP || [];

    if (upperArr.length < 3 || lowerArr.length < 3) {return 0;}

    const upperMid = midPoint(upperArr);
    const lowerMid = midPoint(lowerArr);
    if (!upperMid || !lowerMid) {return 0;}

    // Find extreme mouth corners from the *combined* lip points (robust to indexing)
    const combined = [...upperArr, ...lowerArr];
    let left = combined[0];
    let right = combined[0];
    for (let i = 1; i < combined.length; i++) {
      if (combined[i].x < left.x) {left = combined[i];}
      if (combined[i].x > right.x) {right = combined[i];}
    }

    const verticalGap = distance(upperMid, lowerMid);
    const width = Math.max(distance(left, right), 1e-6); // avoid /0
    return verticalGap / width;
  };

  // Update mouth dynamics and return label ('Talking' | 'Yawning' | null)
  const updateMouthState = (lipRatio: number) => {
    // thresholds (tune on your device)
    const OPEN_T = 0.22;   // mouth considered open
    const YAWN_AVG_T = 0.3;
    const TALK_VAR_T = 0.001;

    // keep rolling history
    lipHistory.current.push(lipRatio);
    openHistory.current.push(lipRatio > OPEN_T ? 1 : 0);
    if (lipHistory.current.length > MAX_HISTORY) {lipHistory.current.shift();}
    if (openHistory.current.length > MAX_HISTORY) {openHistory.current.shift();}

    const n = lipHistory.current.length;
    if (n < 6) {return null;} // need a few frames

    // mean & variance
    const avg = lipHistory.current.reduce((a, b) => a + b, 0) / n;
    const variance =
      lipHistory.current.reduce((a, b) => a + (b - avg) * (b - avg), 0) / n;

    // transitions (how often open/close flips)
    let transitions = 0;
    for (let i = 1; i < openHistory.current.length; i++) {
      if (openHistory.current[i] !== openHistory.current[i - 1]) {transitions++;}
    }
    const openRatio = openHistory.current.reduce((a, b) => a + b, 0) / n;

    // Heuristics:
    // Yawning: big + steady open (avg high, low transitions, mostly open)
    if (avg > YAWN_AVG_T && transitions <= 2 && openRatio > 0.7) {
      yawningFrames.current++;
      talkingFrames.current = 0;
      if (yawningFrames.current > 5) {return 'Yawning';}
      return null;
    } else {
      yawningFrames.current = 0;
    }
      console.log(variance,transitions);
    // Talking: frequent fluctuations (many transitions / higher variance)
    if (transitions >= 5 && variance > TALK_VAR_T) {
      talkingFrames.current++;
      if (talkingFrames.current > 8) {return 'Talking';}
      return null;
    } else {
      talkingFrames.current = 0;
    }

    return null;
  };

  function onFacesDetected(faces: Face[]) {
    if (faces.length === 0) {
      setStatus('No driver detected');
      // also clear history so states don't linger
      lipHistory.current = [];
      openHistory.current = [];
      closedEyeFrames.current = 0;
      distractedFrames.current = 0;
      talkingFrames.current = 0;
      yawningFrames.current = 0;
      return;
    }

    const face = faces[0];

    // --- Drowsy (eye probabilities) ---
    const leftEye = face.leftEyeOpenProbability ?? 1;
    const rightEye = face.rightEyeOpenProbability ?? 1;
    const avgEye = (leftEye + rightEye) / 2;

    if (avgEye < 0.30) {closedEyeFrames.current++;}
    else {closedEyeFrames.current = 0;}

    if (closedEyeFrames.current > 15) {
      setStatus('⚠️ Drowsy Driver Detected!');
      return;
    }

    // --- Distracted (yaw/pitch) ---
    const yaw = face.yawAngle ?? 0;   // side look
    const pitch = face.pitchAngle ?? 0; // up/down
    if (Math.abs(yaw) > 25 || Math.abs(pitch) > 20) {distractedFrames.current++;}
    else {distractedFrames.current = 0;}

    if (distractedFrames.current > 10) {
      setStatus('⚠️ Distracted Driver!');
      return;
    }

    // --- Talking vs Yawning (contours only) ---
    const lipRatio = calcLipOpenRatio(face.contours);
    const mouthLabel = updateMouthState(lipRatio);

    // Optional: quick console debug
    // console.log({ lipRatio: lipRatio.toFixed(3), yaw, pitch, avgEye: avgEye.toFixed(2) });

    if (mouthLabel === 'Yawning') {
      setStatus('⚠️ Driver Yawning!');
      return;
    }

    if (mouthLabel === 'Talking') {
      setStatus('⚠️ Driver Talking!');
      return;
    }

    // --- Default ---
    setStatus('✅ Driver Attentive');
  }

  if (!device) {
    return (
      <View style={styles.center}>
        <Text>No camera device found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FaceCamera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        faceDetectionCallback={onFacesDetected}
        faceDetectionOptions={faceDetectionOptions}
      />
      <View style={styles.overlay}>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  overlay: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 8,
  },
});
