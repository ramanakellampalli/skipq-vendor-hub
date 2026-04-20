<p align="center">
  <h1 align="center">⚡ SkipQ — Vendor Hub</h1>
  <p align="center">Manage your campus stall. Receive orders instantly.</p>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.85-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Real--time-Ably-FF5416?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Platform-Android-3DDC84?style=for-the-badge&logo=android&logoColor=white" />
</p>

---

## What is SkipQ?

SkipQ is a campus food ordering platform. Students order ahead — vendors receive and fulfill. No missed orders, no shouting across a counter.

This is the **vendor-facing Android app**.

---

## Features

| | |
|---|---|
| 📡 **Live order feed** | New orders arrive instantly via Ably push — no refresh needed |
| ✅ **Order management** | Accept → Preparing → Ready → Done in one tap |
| 🍽️ **Menu editor** | Add items, set prices, toggle availability, delete |
| 🔓 **Store control** | Toggle open/closed, set default prep time |
| 📋 **Order history** | All past completed and rejected orders |
| 🏫 **Campus-linked** | Your stall is scoped to your campus — only your students see you |

---

## Real-Time Architecture

```
  Student places order
          ↓
   Spring Boot backend
          ↓
   Publishes to Ably: vendor:{vendorId}
          ↓
   Vendor app receives event instantly
   (subscribed on login — no polling)
```

Orders arrive in **under a second**. The Zustand store is the single source of truth — all tabs stay in sync automatically.

---

## Getting Started

### Prerequisites

- Node 22+
- Android SDK (API 34+)
- JDK 21
- Connected Android device or emulator

### Install

```bash
git clone https://github.com/ramanakellampalli/skipq-vendor-hub.git
cd skipq-vendor-hub
npm install
```

### Environment

Create `.env` in the project root (gitignored):

```env
API_URL=https://skipq-core-dev-obh3j3jqpa-el.a.run.app
```

### Run

```bash
# Start Metro
npx react-native start

# Build + install on device (separate terminal)
cd android && ./gradlew app:assembleDebug --no-daemon
~/Library/Android/sdk/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk

# Forward Metro port to device
~/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081
```

> **Build tip:** If the build fails after clearing `~/.gradle/caches`, always run with `--no-daemon` to let Gradle recreate the transform cache cleanly.

---

## Dev Testing

### ✅ Create a test vendor (dev backend)

1. Log into the **Admin Hub**
2. Go to **Vendors → Create Vendor**
3. Use any email — e.g. `vendor1@test.skipq.dev`
4. Log into this app immediately with:

| Field | Value |
|-------|-------|
| Email | The email you entered |
| Password | `Test@1234` |

No invite email. No setup flow. Straight in. 🎉

### Vendor onboarding (prod)

In production, creating a vendor triggers an invite email with a deep link:

```
skipq://vendor/setup?token=xxx
```

The vendor taps the link on their Android device → **Setup Password screen** → sets password + business details → account activated.

---

## Project Structure

```
src/
├── api/            # Axios client + typed API calls
├── components/     # Shared UI: OrderCard, StatusBadge, etc.
├── hooks/          # useVendorSocket — Ably real-time subscription
├── navigation/     # Stack + tab navigators, deep link config
├── screens/
│   ├── auth/       # Login, SetupPassword
│   ├── history/    # Past orders
│   ├── menu/       # Menu management
│   ├── orders/     # Live order feed + order detail
│   └── profile/    # Store profile
├── store/          # Zustand: authStore, vendorStore
├── theme/          # Colors, typography, spacing
└── types/          # Shared TypeScript types
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend base URL |
| `ABLY_API_KEY` | Ably API key for real-time order push |

Managed via `react-native-config`. Set in `.env` — injected at build time.

---

## Building for Release (Play Store)

### Prerequisites

- JDK 17
- Android SDK
- Release keystore at `~/skipq-keystores/skipq-vendor-release.keystore`
- `android/gradle.properties` with signing config (not committed — add locally):

```properties
SKIPQ_VENDOR_STORE_FILE=/Users/<you>/skipq-keystores/skipq-vendor-release.keystore
SKIPQ_VENDOR_KEY_ALIAS=skipq-vendor
SKIPQ_VENDOR_STORE_PASSWORD=<password>
SKIPQ_VENDOR_KEY_PASSWORD=<password>
```

### Build release AAB

```bash
cd android
./gradlew bundleRelease --no-daemon
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

Upload this file to Google Play Console → Internal Testing → Production.

### macOS Gatekeeper issue

If the build fails with `AAPT2 Daemon startup failed`, run:

```bash
sudo xattr -dr com.apple.quarantine ~/.gradle/caches/9.3.1/transforms/
```

Then retry the build.

### Package name
`com.skipqvendorhub`
