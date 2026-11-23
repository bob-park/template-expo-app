---
title: Tech Stack & Requirements
scope: package.json, app.config.ts
applies_to: dependency selection, version bumps
related:
  - ./overview.md
  - ./workflows/dev-env.md
---

# Tech Stack & Requirements

> Expo SDK 58 + React Native 0.88 (RC) + React 19.3, TypeScript ~6.0 strict. expo-router ~58 + NativeWind v5(Tailwind 4) + TanStack Query v5 + ky + zustand v5 + i18next + dayjs. Yarn 4, Node (mise).

- **Framework:** Expo SDK 58, React Native 0.88 (RC), React 19.3
- **Language:** TypeScript ~6.0 (`strict: true`)
- **Routing:** expo-router ~58 (file-based, typed routes)
- **Styling:** NativeWind v5 (Tailwind CSS v4)
- **Server state:** `@tanstack/react-query` v5
- **HTTP:** `ky`
- **Storage:** `expo-secure-store`, `@react-native-async-storage/async-storage`
- **Notifications:** `expo-notifications`
- **i18n:** `i18next` v27 + `react-i18next` v18 + `expo-localization`
- **Animation:** `lottie-react-native` v7, `@lottiefiles/dotlottie-react`, `react-native-reanimated` v4 (`react-native-worklets`)
- **Date:** `dayjs` (ko locale + duration/relativeTime plugins)
- **Client global state:** `zustand` v5 (slice 패턴, `immer` middleware)
- **Package manager / runtime:** Yarn 4 (Berry), Node — 둘 다 버전은 `../../mise.toml` 로 mise 가 고정
- **Path alias:** `@/*` → `src/*`, `@/assets/*` → `assets/*`

정확한 핀 버전은 `package.json` 을 참조한다.
