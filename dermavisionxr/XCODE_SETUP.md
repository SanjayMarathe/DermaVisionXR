# Running DermaVision XR in visionOS Simulator via Xcode

Since `webspatial-builder` has compatibility issues with visionOS 2.0+ simulators, here's how to run your app directly through Xcode.

## Prerequisites

- Xcode 15+ installed
- visionOS SDK installed (Xcode > Settings > Platforms)
- visionOS Simulator available

## Steps

### 1. Build the WebSpatial Project Files

First, generate the Xcode project files:

```bash
cd /Users/sanjaymarathe/Documents/xr-demo/dermavisionxr

# This creates the Xcode project structure in node_modules
npx webspatial-builder init --base=http://localhost:4321/webspatial/avp
```

### 2. Start Your Dev Server

In one terminal, run the AVP dev server:

```bash
npm run start:avp
```

This will start serving your app at `http://localhost:4321`

### 3. Open the Xcode Project

```bash
open node_modules/.webspatial-builder-temp/platform-visionos/project/web-spatial.xcodeproj
```

### 4. Configure Xcode

Once Xcode opens:

1. **Select the Target**:
   - In the top toolbar, click the device selector (next to the play button)
   - Choose "Apple Vision Pro" simulator

2. **Set the Scheme**:
   - Product > Scheme > web-spatial

3. **Check Build Settings**:
   - Click on "web-spatial" project in the left sidebar
   - Select the "web-spatial" target
   - Go to "Signing & Capabilities" tab
   - Uncheck "Automatically manage signing" (for simulator testing)

### 5. Build and Run

- Click the Play button (▶️) or press `Cmd + R`
- Xcode will:
  - Build the app
  - Launch visionOS Simulator
  - Install and run DermaVision XR

### 6. Test Your App

The simulator will open and you should see:
- Landing page with spatial glass panels
- Camera access prompt (will use your Mac's camera in simulator)
- Full navigation and functionality

## Alternative: Direct Simulator Method

If the above doesn't work, try opening the simulator first:

```bash
# 1. Open visionOS Simulator
open -a Simulator

# 2. From Simulator menu: File > Open Simulator > Apple Vision Pro

# 3. Build for simulator with specific device ID
cd /Users/sanjaymarathe/Documents/xr-demo/dermavisionxr

# Get your simulator ID (from earlier output: 50BEA4F8-01AA-45AE-B20C-86E13D94D18B)
xcrun simctl list devices visionOS

# 4. Try building with explicit device
xcodebuild -project node_modules/.webspatial-builder-temp/platform-visionos/project/web-spatial.xcodeproj \
  -scheme web-spatial \
  -destination 'platform=visionOS Simulator,id=50BEA4F8-01AA-45AE-B20C-86E13D94D18B' \
  -derivedDataPath build \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO
```

## Troubleshooting

### Issue: "No such file or directory" for Xcode project

**Solution**: The webspatial-builder creates the project dynamically. Run this first:

```bash
cd /Users/sanjaymarathe/Documents/xr-demo/dermavisionxr
mkdir -p node_modules/.webspatial-builder-temp
cp -r node_modules/@webspatial/platform-visionos/project node_modules/.webspatial-builder-temp/platform-visionos/
```

### Issue: Camera not working in simulator

**Solution**: The simulator will use your Mac's camera. Grant camera permissions when prompted.

### Issue: Spatial features not showing

**Solution**: Make sure you're viewing in the visionOS Simulator, not the iOS Simulator. The spatial materials only render in visionOS.

## Quick Testing Workflow

For rapid development, use this workflow:

```bash
# Terminal 1: Development server
npm run dev
# Test at http://localhost:5176 in Chrome/Safari

# Terminal 2: AVP server (when ready for spatial testing)
npm run start:avp

# Terminal 3: Open in Xcode
open node_modules/.webspatial-builder-temp/platform-visionos/project/web-spatial.xcodeproj
```

## Browser Testing (Recommended for Development)

The easiest way to test camera and functionality:

```bash
npm run dev
# Open http://localhost:5176 in your browser
```

This tests:
- ✅ Camera access (uses Mac camera)
- ✅ All UI interactions
- ✅ Navigation flow
- ✅ Analysis pipeline
- ⚠️ Spatial features (won't show in browser, but markup is there)

## Production Build

When ready to deploy:

```bash
# Build web version
npm run build

# Build visionOS version
XR_ENV=avp npm run build

# The visionOS build will be in dist/
# Deploy dist/ to your web server
# Then use webspatial-builder publish to submit to App Store
```

---

**Note**: The `webspatial-builder run` command has a known issue with visionOS 2.0+ simulators. Using Xcode directly is the recommended approach for now. The WebSpatial team is aware and working on a fix.
