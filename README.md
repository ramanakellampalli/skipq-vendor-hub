# skipq-vendor-hub

Vendor-facing React Native app for SkipQ — receive orders in real time, manage menu, and update order status. Android first.

## Stack

- React Native 0.85.1 (bare workflow)
- TypeScript
- Zustand (single store, NgRx-style)
- TanStack Query v5
- Ably (real-time order push)
- Axios
- React Navigation (bottom tabs + stack)

## Features

- **Orders tab** — live order feed via Ably, tap to view details and advance status
- **Menu tab** — add, edit, toggle availability, delete menu items
- **Profile tab** — update store name, prep time, open/closed toggle
- **History tab** — past completed and rejected orders

## Real-time

On login the app subscribes to the `vendor:{vendorId}` Ably channel. New orders and status updates arrive instantly without polling. The Zustand store (`vendorStore`) is the single source of truth — all tabs read from it.

## Deep link

Vendor onboarding uses a deep link from the invite email:

```
skipq://vendor/setup?token=xxx
```

Opens the Setup Password screen directly on the device.

## Setup

### Requirements

- Node 22+
- Android SDK (API 34+)
- JDK 21
- A connected Android device or emulator

### Run

```bash
npm install

# Start Metro
npx react-native start

# In a separate terminal — build and install
cd android && ./gradlew app:assembleDebug --no-daemon
~/Library/Android/sdk/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk

# Reverse Metro port to device
~/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081
```

### Note on Gradle cache

If the build fails after deleting `~/.gradle/caches`, run with `--no-daemon` to let Gradle recreate the transform cache cleanly.

## Project structure

```
src/
├── api/            # Axios client + API calls
├── components/     # Shared UI components
├── hooks/          # useVendorSocket (Ably)
├── navigation/     # Stack + tab navigators, deep link config
├── screens/
│   ├── auth/       # Login, SetupPassword
│   ├── history/    # HistoryScreen
│   ├── menu/       # MenuScreen
│   ├── orders/     # OrdersScreen, OrderDetailScreen
│   └── profile/    # ProfileScreen
├── store/          # Zustand vendorStore + authStore
├── theme/          # Colors, spacing, radius
└── types/          # Shared TypeScript types
```
