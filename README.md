# SkipQ — Vendor Hub

> Manage your campus stall. Receive orders instantly.

The vendor-facing mobile app for SkipQ. Accept incoming orders in real time, manage your menu, and control your store — all from your Android device.

Built with **React Native** (bare workflow), Android-first.

---

## Features

- **Live order feed** — new orders appear instantly via Ably push, no refresh needed
- **Order management** — accept, mark ready, complete or reject orders with one tap
- **Menu editor** — add items, set prices, toggle availability, delete
- **Store control** — toggle open/closed, update prep time
- **Order history** — view all past completed and rejected orders
- **Campus-linked** — your stall is tied to your campus; only students from that campus see you

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.85 (bare workflow) |
| Language | TypeScript |
| State | Zustand |
| Navigation | React Navigation (bottom tabs + stack) |
| Real-time | Ably (WebSocket push) |
| API | Axios + react-native-config (env-based URL) |
| Auth | JWT + AsyncStorage |

---

## Real-Time Orders

On login the app subscribes to the `vendor:{vendorId}` Ably channel. The backend publishes to this channel whenever a student places an order or an order state changes. No polling — orders arrive in under a second.

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

Create a `.env` file in the project root (gitignored):

```env
API_URL=https://skipq-core-dev-obh3j3jqpa-el.a.run.app
```

### Run

```bash
# Start Metro bundler
npx react-native start

# Build and install on device / emulator (in a separate terminal)
cd android && ./gradlew app:assembleDebug --no-daemon
~/Library/Android/sdk/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk

# Reverse Metro port so the device can reach your machine
~/Library/Android/sdk/platform-tools/adb reverse tcp:8081 tcp:8081
```

> **Tip:** If the build fails after clearing `~/.gradle/caches`, run with `--no-daemon` to let Gradle recreate the transform cache cleanly.

---

## Dev Testing

Vendor accounts on the dev backend are created via the **Admin Hub**. When `otp.bypass=true` is active on the backend (dev only), accounts are ready to use immediately — no invite email.

### Create a test vendor (dev)

1. Log into the Admin Hub with an admin account
2. Go to **Vendors → Create Vendor**
3. Fill in any email (e.g. `vendor1@test.skipq.dev`) and stall details
4. Log into this app with:

| Field | Value |
|-------|-------|
| Email | The email you entered |
| Password | `Test@1234` |

No email needed, no setup flow — straight into the app.

### Vendor onboarding (prod)

In production, creating a vendor triggers an invite email with a deep link:

```
skipq://vendor/setup?token=xxx
```

The vendor taps the link on their Android device → opens the Setup Password screen → sets their password and business details → account activated.

---

## Project Structure

```
src/
├── api/            # Axios client + typed API calls
├── components/     # Shared UI (OrderCard, StatusBadge, etc.)
├── hooks/          # useVendorSocket (Ably real-time)
├── navigation/     # Stack + tab navigators, deep link config
├── screens/
│   ├── auth/       # LoginScreen, SetupPasswordScreen
│   ├── history/    # HistoryScreen
│   ├── menu/       # MenuScreen
│   ├── orders/     # OrdersScreen, OrderDetailScreen
│   └── profile/    # ProfileScreen
├── store/          # Zustand: authStore, vendorStore
├── theme/          # Colors, typography, spacing
└── types/          # Shared TypeScript types
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `API_URL` | Backend base URL (dev or prod) |

Managed via `react-native-config`. Values in `.env` are injected at build time.
