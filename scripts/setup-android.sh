#!/usr/bin/env bash
# Generates a native RN 0.73 Android project, drops in SignalSpot sources, and builds a release APK.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/build/SignalSpotApp"
rm -rf "$ROOT/build"; mkdir -p "$ROOT/build"; cd "$ROOT/build"
npx --yes @react-native-community/cli@12 init SignalSpotApp --version 0.73.6 --package-name com.signalspot --title SignalSpot --skip-install --skip-git-init
cd "$APP"
npm install
# React Native 0.73.6 is compatible with React 18.3.x; keep React aligned with react-native-maps peers.
npm install react@18.3.1 --save-exact
node -e '
const p=require(process.env.ROOT+"/package.json").dependencies;
delete p["react"];delete p["react-native"];
require("child_process").execSync("npm install --save "+Object.entries(p).map(([k,v])=>`${k}@\"${v}\"`).join(" "),{stdio:"inherit"});' 
cp -r "$ROOT/src" ./src && cp "$ROOT/App.tsx" ./App.tsx
# Native module
J=android/app/src/main/java/com/signalspot
cp "$ROOT/android-native/SignalModule.kt" $J/SignalModule.kt
cat > $J/SignalPackage.kt <<'KT'
package com.signalspot
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.*
import com.facebook.react.uimanager.ViewManager
class SignalPackage: ReactPackage {
  override fun createNativeModules(c: ReactApplicationContext): List<NativeModule> = listOf(SignalModule(c))
  override fun createViewManagers(c: ReactApplicationContext): List<ViewManager<*, *>> = emptyList()
}
KT
sed -i 's#// add(MyReactNativePackage())#add(SignalPackage())#' $J/MainApplication.kt
# Permissions + Maps key
M=android/app/src/main/AndroidManifest.xml
sed -i 's#<uses-permission android:name="android.permission.INTERNET" />#<uses-permission android:name="android.permission.INTERNET" /><uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />#' $M
sed -i "s#</application>#<meta-data android:name=\"com.google.android.geo.API_KEY\" android:value=\"${MAPS_API_KEY:-MISSING_KEY}\"/></application>#" $M
cd android && chmod +x gradlew && ./gradlew assembleRelease --no-daemon
mkdir -p "$ROOT/dist" && cp app/build/outputs/apk/release/app-release.apk "$ROOT/dist/SignalSpot.apk"
echo "APK: $ROOT/dist/SignalSpot.apk"
