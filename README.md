# Face Landmark Detection App

A React Native app demonstrating **real-time face landmark and contour detection** using [VisionCamera](https://github.com/mrousavy/react-native-vision-camera) and [VisionCameraFaceDetector](https://github.com/luicfrr/react-native-vision-camera-face-detector).  
The app tracks facial landmarks to estimate **eye openness, mouth movements, and head orientation** for detecting states like drowsiness, distraction, and talking.

---

## 🚀 Features
- Real-time face detection with landmarks & contours  
- Detects:
  - 👁️ Eye closure (drowsiness detection)  
  - 👀 Head pose (distraction detection)  
  - 👄 Mouth activity (talking & yawning detection)  
- Threshold-based detection logic (easily configurable)  
- Works on both iOS & Android  

---

## 🎥 Demo


https://github.com/user-attachments/assets/cf0fc9b6-fbae-4ad4-835d-fcf7ad3ea018



---

## 🧩 Tech Stack
- [React Native](https://reactnative.dev/) 
- [VisionCamera](https://github.com/mrousavy/react-native-vision-camera/)  
- [VisionCameraFaceDetector](https://github.com/luicfrr/react-native-vision-camera-face-detector)

---

## 🧠 Detection Logic
The app checks facial features frame by frame:  
- **Drowsy** 💤 → Eyes remain closed for a short duration.  
- **Yawning** 😴 → Mouth opens wide and stays that way briefly.  
- **Talking** 🗣️ → Lips move repeatedly in smaller motions.  
- **Distracted** 👀 → Head is turned away from the center too far.  

---

## 🌍 Use Cases

This app can be adapted for multiple scenarios beyond driver safety. Some examples:

### 1. 🚗 Driver Monitoring
- Detects if a driver is **drowsy** or **distracted**.  
- Can trigger alerts to improve road safety.

### 2. 🧑‍💻 Remote Work & Productivity
- Monitor **attention span** during online classes or meetings.  
- Identify if the user is distracted from the screen.

### 3. 🧑‍⚕️ Healthcare & Wellness
- Track **fatigue levels** for patients.  
- Monitor **sleepiness signs** in individuals at risk of sleep disorders.

### 4. 🎮 Interactive Applications
- Enable **gesture-based interactions** in games.  
- Talking or yawning can be used as **controls/inputs**.

### 5. 📱 Accessibility
- Assist users with limited mobility by using **facial gestures** to trigger commands.  
- Example: mouth open = "select", head turn = "next".

### 6. 🎬 Content Creation
- Can be used for **face-driven animations**.  
- Talking detection can sync with avatars or lip-sync models.

---


## 🛠️ Installation

### Prerequisites
- Node.js >= 16  
- React Native >= 0.72  
- Xcode (for iOS) / Android Studio (for Android)  
- CocoaPods (for iOS dependencies)

### Steps
```bash
# Clone the repo
git clone https://github.com/munishvira/react-native-face-detection.git
cd FaceLandmarksTS

# Install dependencies
yarn install

# iOS setup
cd ios && pod install && cd ..

# Start Metro bundler
yarn start

# Run on device/emulator
yarn ios   # for iOS
yarn android   # for Android
```
---

## ✨ Future Ideas
- Add sound/vibration alerts  
- Support multiple faces at once  
- Store activity logs  
- AI-driven fatigue prediction  
- Integration with AR/VR apps  

---
## 💡 About the Author

👨‍💻 **Munish Vira**  
Senior Software Engineer | React Native Specialist | 4+ years experience  

- 💼 4+ years experience in **React Native, React, Next.js**  
- 🚀 Scaled apps to **1,000+ concurrent users** with **40% performance boost**  
- 📱 Expert in **animations, in-app purchases, analytics, and cross-platform scaling**  

📧 Email: [munishvira1999@gmail.com](mailto:munishvira1999@gmail.com)  
🔗 LinkedIn: [linkedin.com/in/munish-vira](https://www.linkedin.com/in/munish-vira)  
💻 GitHub: [github.com/munishvira](https://github.com/munishvira)  
🌐 Portfolio: [munishvira.github.io](https://munishvira.github.io)  

## ⚡ Feel free to fork, improve, or use this as a starter for your own reels-like project!

---
