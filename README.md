# SignalSpot – Internet Speed & Best Location Finder
React Native + TypeScript. All speed numbers come from real traffic to Cloudflare's speed endpoints (cache-busted, `no-store`). Nothing is simulated.

## Setup
1. `npx @react-native-community/cli init SignalSpot --template react-native-template-typescript`, then copy `App.tsx`, `src/`, and merge `package.json` dependencies.
2. `npm install && cd ios && pod install`
3. Android: copy `android-native/SignalModule.kt` to `android/app/src/main/java/com/signalspot/`, add a `SignalPackage` (returns `listOf(SignalModule(ctx))`) and register it in `MainApplication.getPackages()`. Add a Google Maps API key in `AndroidManifest.xml`.
4. `npm run android` / `npm run ios`

## Permissions
**AndroidManifest.xml:** `INTERNET`, `ACCESS_NETWORK_STATE`, `ACCESS_FINE_LOCATION`, `READ_PHONE_STATE`, `VIBRATE`
**Info.plist:** `NSLocationWhenInUseUsageDescription` = "SignalSpot tags speed tests with your location to build a signal map. Location never leaves your device."
Permissions are requested only when you enable the feature that needs them.

## How it works
- **Live monitor** (`useMonitor`): 6 tiny requests every N s → median ping, jitter, loss (~1 KB). Pauses in background.
- **Full test**: 10 MB down + 3 MB up on demand; usage counted against your data limit.
- **Score** (`utils/scoring.ts`): weighted down 30 / ping 25 / loss 15 / up 10 / jitter 10 / dBm 10; unavailable metrics are dropped and weights renormalised.
- **Best spot** (`utils/bestSpot.ts`): EMA-smoothed score; "new best" = +5 over previous best; trend from last 5 readings.

## Platform limits
- **iOS cannot read dBm, carrier signal or radio details** (no public API). Those show "N/A". Network generation on iOS comes from NetInfo only.
- Android dBm needs the native module and `READ_PHONE_STATE`; some devices return nothing.
- Live mode doesn't measure bandwidth; the gauge shows the last full-test download.
- Sound alerts and light theme: settings exist but are not wired yet (add react-native-sound where haptics fire in `useMonitor`; theme tokens live in `components/index.tsx`).
- Map "heatmap" is translucent colored circles (works on Apple and Google maps).
- Storage is MMKV (persistent, capped at 2000 records); swap for SQLite if you need queries.

## Build the APK (no local Android setup)
1. Push this folder to a new GitHub repo (branch `main`).
2. Optional: add repo secret `MAPS_API_KEY` (Google Maps SDK for Android key). Without it the app works but the Map tab stays blank.
3. Actions tab → **Build Android APK** → Run workflow. Download `SignalSpot-apk` from the run (~10–15 min).
4. Copy `SignalSpot.apk` to your phone and allow "install unknown apps". It is signed with the debug keystore (fine for personal use, not Play Store).

Local build instead: install JDK 17 + Android SDK, then `ROOT=$(pwd) ./scripts/setup-android.sh`.
