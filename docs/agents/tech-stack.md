---
title: Tech Stack & Requirements
scope: package.json, app.config.ts
applies_to: dependency selection, version bumps
related:
  - ./overview.md
  - ./workflows/dev-env.md
---

# Tech Stack & Requirements

> Expo ~55 + React Native 0.83 + React 19, TypeScript strict. expo-router + NativeWind(Tailwind 4) + TanStack Query + ky + zustand + i18next + dayjs. Yarn 4, Node ≥ 24.

- **Framework:** Expo ~55, React Native 0.83, React 19
- **Language:** TypeScript (`strict: true`)
- **Routing:** expo-router (file-based, typed routes)
- **Styling:** NativeWind (Tailwind CSS v4)
- **Server state:** `@tanstack/react-query`
- **HTTP:** `ky`
- **Storage:** `expo-secure-store`, `@react-native-async-storage/async-storage`
- **i18n:** `i18next` + `react-i18next` + `expo-localization`
- **Date:** `dayjs` (ko locale + duration/relativeTime plugins)
- **Client global state:** `zustand` (immer + persist + devtools middleware)
- **Package manager / runtime:** Yarn 4 (Berry), Node LTS ≥ 24
- **Path alias:** `@/*` → `src/*`, `@/assets/*` → `assets/*`

정확한 핀 버전은 `package.json` 을 참조한다.
