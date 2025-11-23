# DermaVision XR - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Setup Environment

```bash
cd dermavisionxr
npm install
cp .env.example .env.local
```

### Step 2: Test in Browser

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

You should see:
1. **Landing Page** - Welcome screen with features
2. Click **"Start Skin Analysis"**
3. **Camera Page** - Allow camera access when prompted
4. **Live Feed** - See your camera with scanning reticle
5. Click **"Capture & Analyze"** to simulate diagnosis

### Step 3: Run on Apple Vision Pro Simulator

**Terminal 1** - Start AVP Dev Server:
```bash
npm run start:avp
```

**Terminal 2** - Launch Simulator:
```bash
npm run simulate:avp
```

The visionOS Simulator will open with DermaVision running in spatial mode!

## 🎯 What to Expect

### Landing Page (Page 1)
- Beautiful spatial glass morphism design
- 3 feature cards explaining capabilities
- "Start Skin Analysis" button

### Scan Page (Page 2)
- **Live Camera Feed**: Uses AVP outward-facing cameras
- **Target Reticle**: Frame for positioning skin lesions
- **Status Indicators**: Camera status and scanning state
- **Capture Button**: Analyze the current frame
- **Results Panel**: Shows diagnosis with confidence %

## 🎨 Spatial Features (AVP Mode)

When running on Vision Pro:
- UI elements have depth with `--xr-background-material`
- Glass panels use "thick" material
- Buttons use "translucent" material
- Cards float in 3D space

## 📸 Camera Implementation

The app accesses cameras using Web APIs:
```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    facingMode: 'environment', // Outward cameras
    width: { ideal: 1920 },
    height: { ideal: 1080 }
  }
})
```

## 🧪 Testing the App

### Browser Mode
- ✅ UI components render
- ✅ Navigation works
- ✅ Camera access (using your device camera)
- ✅ Mock analysis runs

### Spatial Mode (AVP)
- ✅ 3D glass materials
- ✅ Spatial depth
- ✅ AVP camera access
- ✅ Touch interactions
- ✅ Spatial audio (if added)

## 🔧 Troubleshooting

### Camera Not Working?
- Grant camera permissions in browser/system settings
- Check console for error messages
- Ensure HTTPS or localhost (required for camera access)

### Simulator Won't Launch?
- Ensure Xcode is installed
- Check `XR_DEV_PORT` in `.env.local`
- Verify `webspatial-builder` is installed

### TypeScript Errors?
- Restart VS Code TypeScript server
- Run `npm install` again
- Check `tsconfig.json` includes src folder

## 📱 Next Steps

1. **Connect Real ML API**: Replace mock analysis with actual backend
2. **Add Image Storage**: Save captured frames
3. **History Feature**: Show past analyses
4. **Export Results**: PDF/image export capability
5. **Multi-lesion Detection**: Analyze multiple lesions
6. **3D Visualization**: Show lesion depth with spatial rendering

## 🏥 Important Notes

⚠️ **Medical Disclaimer**: This is a demonstration app only. Not for clinical use.

🔐 **Privacy**: Camera data is processed locally, no uploads in demo mode.

📊 **HAM10000**: Current diagnoses are mock data. Integrate real model for production.

## 🎓 Learning Resources

- [WebSpatial Docs](https://webspatial.dev)
- [HealthXR Template](https://github.com/steve-dusty/healthxr)
- [HAM10000 Dataset](https://www.kaggle.com/datasets/kmader/skin-cancer-mnist-ham10000)
- [visionOS Developer Guide](https://developer.apple.com/visionos/)

## 🤝 Need Help?

Check the main README.md for detailed documentation on:
- Architecture details
- API integration
- Deployment steps
- Production considerations
