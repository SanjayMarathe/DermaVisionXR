# DermaVision XR

An advanced spatial computing application for dermatoscopic skin lesion analysis, powered by Apple Vision Pro and the HAM10000 dataset.

## 🎯 Features

- **Landing Page**: Beautiful spatial interface introducing the application
- **Live Camera Analysis**: Real-time skin lesion detection using AVP's outward-facing cameras
- **AI-Powered Diagnosis**: Analysis based on 10,000+ verified dermatoscopic cases
- **Spatial UI**: Immersive 3D visualization with WebSpatial SDK
- **Computer Vision**: Direct camera access for live tissue examination

## 🏗️ Architecture

Based on the HealthXR template, this app demonstrates:
- WebSpatial SDK integration for visionOS
- MediaDevices API for camera access
- React-based spatial UI components
- Real-time video processing and frame capture

## 📋 Prerequisites

- Node.js 18+
- Apple Vision Pro Simulator or Device
- Xcode (for visionOS development)
- WebSpatial CLI tools

## 🚀 Installation

```bash
npm install
cp .env.example .env.local
```

Edit `.env.local` and set:
```
XR_DEV_PORT=4321
XR_DEV_SERVER=http://localhost:4321/webspatial/avp
```

## 💻 Development

### 1. Start Web Dev Server (Browser Testing)

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 2. Start AVP Dev Server (Spatial Mode)

Open a new terminal:

```bash
npm run start:avp
```

### 3. Launch in AVP Simulator

Open a third terminal:

```bash
npm run simulate:avp
```

This will:
1. Build the app for visionOS
2. Launch the visionOS Simulator
3. Install and run DermaVision

## 📱 Usage

1. **Landing Page**: Click "Start Skin Analysis" to proceed
2. **Camera Access**: Grant camera permissions when prompted
3. **Positioning**: Frame the skin lesion within the target reticle
4. **Analysis**: Click "Capture & Analyze" to run AI diagnosis
5. **Results**: View diagnosis, confidence level, and recommendations

## 🎨 Page Structure

### Landing Page (`LandingPage.tsx`)
- Spatial-enabled welcome screen
- Feature cards with app capabilities
- Launch button to start analysis

### Scan Page (`ScanPage.tsx`)
- Live camera feed from AVP outward cameras
- Real-time scanning interface with target reticle
- Frame capture and AI analysis
- Results display with diagnosis and recommendations

## 🔧 Technical Details

### Camera Access
The app uses `navigator.mediaDevices.getUserMedia()` with:
- `facingMode: 'environment'` for outward cameras
- 1920x1080 resolution
- Real-time video streaming

### Spatial Features
- `data-enable-xr` attributes on key UI elements
- `--xr-background-material` CSS properties
- Glass morphism effects for depth
- Spatial positioning and animations

### AI Analysis (Mock)
Currently simulates analysis with HAM10000 diagnoses:
- Melanocytic Nevus
- Benign Keratosis
- Dermatofibroma
- Vascular Lesion

In production, replace with actual API calls to your ML backend.

## 📊 HAM10000 Dataset

This app references the HAM10000 (Human Against Machine with 10000 training images) dataset:
- 10,015 dermatoscopic images
- 7 categories of pigmented lesions
- Collected from different populations

## 🏥 Medical Disclaimer

**This application is for demonstration purposes only.** It is not intended for clinical diagnosis or medical decision-making. Always consult qualified healthcare professionals for skin lesion evaluation.

## 🛠️ Build Commands

```bash
# Development
npm run dev              # Web dev server
npm run start:avp        # AVP dev server
npm run simulate:avp     # Launch simulator

# Production
npm run build            # Build for web
XR_ENV=avp npm run build # Build for visionOS
```

## 📦 Dependencies

- `@webspatial/react-sdk` - Spatial UI components
- `@webspatial/core-sdk` - Core spatial APIs
- `@webspatial/vite-plugin` - Build tooling
- React 19 - UI framework
- TypeScript - Type safety

## 🤝 Contributing

Based on HealthXR template by steve-dusty. Extended for dermatology use case.

## 📄 License

ISC