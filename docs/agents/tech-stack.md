---
title: Tech Stack & Requirements
scope: package.json, app.config.ts
applies_to: dependency selection, version bumps
related:
  - ./overview.md
  - ./workflows/dev-env.md
---

# Tech Stack & Requirements

> Expo SDK 56 + React Native 0.85 + React 19.2, TypeScript ~6.0 strict. expo-router ~56 + NativeWind v5(Tailwind 4) + TanStack Query v5 + ky + zustand v5 + i18next + dayjs. Yarn 4, Node ≥ 24.

- **Framework:** Expo SDK 56, React Native 0.85, React 19.2
- **Language:** TypeScript ~6.0 (`strict: true`)
- **Routing:** expo-router ~56 (file-based, typed routes)
- **Styling:** NativeWind v5 (Tailwind CSS v4)
- **Server state:** `@tanstack/react-query` v5
- **HTTP:** `ky`
- **Storage:** `expo-secure-store`, `@react-native-async-storage/async-storage`
- **Notifications:** `expo-notifications`
- **i18n:** `i18next` v26 + `react-i18next` v17 + `expo-localization`
- **Animation:** `lottie-react-native` v7, `@lottiefiles/dotlottie-react`, `react-native-reanimated` v4 (`react-native-worklets`)
- **Date:** `dayjs` (ko locale + duration/relativeTime plugins)
- **Client global state:** `zustand` v5 (slice 패턴, `immer` middleware)
- **Package manager / runtime:** Yarn 4 (Berry, ≥ 4.14.1), Node LTS ≥ 24
- **Path alias:** `@/*` → `src/*`, `@/assets/*` → `assets/*`

정확한 핀 버전은 `package.json` 을 참조한다.
