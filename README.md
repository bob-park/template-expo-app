# template-expo-app

Expo (React Native) 기반 앱 템플릿 프로젝트입니다. Expo Router, NativeWind, React Query, 그리고 Auth / Notification / App Loader Provider가 사전 구성되어 있습니다.

## 기술 스택

- **Framework**: [Expo](https://expo.dev) ~55, React Native 0.83, React 19
- **Routing**: [expo-router](https://docs.expo.dev/router/introduction) (file-based, typed routes)
- **Styling**: [NativeWind](https://www.nativewind.dev) (Tailwind CSS v4)
- **State / Data**: [@tanstack/react-query](https://tanstack.com/query)
- **HTTP**: [ky](https://github.com/sindresorhus/ky)
- **Storage**: `expo-secure-store`, `@react-native-async-storage/async-storage`
- **Notifications**: `expo-notifications`
- **Language**: TypeScript
- **Package Manager**: Yarn 4 (Berry)

## 요구 사항

- Node.js LTS (>= 20 권장)
- Yarn 4.13.0 이상 (`corepack enable` 후 자동 활성화)
- iOS 빌드: macOS + Xcode + CocoaPods
- Android 빌드: Android Studio + JDK 17
- (선택) [EAS CLI](https://docs.expo.dev/eas/) — 클라우드 빌드/배포 시 필요

## 설치

```bash
# corepack을 통한 yarn 활성화 (최초 1회)
corepack enable

# 의존성 설치
yarn install
```

### 환경 변수 (.env)

프로젝트 루트에 `.env` 파일을 생성하고 아래 변수를 정의해야 합니다. Expo는 `EXPO_PUBLIC_` 접두사가 붙은 변수만 클라이언트 번들에 노출합니다.

```env
# API 서버
EXPO_PUBLIC_API_HOST=https://api.example.com

# OAuth2 인증 서버
EXPO_PUBLIC_AUTHORIZATION_SERVER=https://auth.example.com
EXPO_PUBLIC_AUTHORIZATION_CLIENT_ID=your-client-id
EXPO_PUBLIC_AUTHORIZATION_CLIENT_SECRET=your-client-secret
```

| 변수 | 설명 | 사용처 |
| --- | --- | --- |
| `EXPO_PUBLIC_API_HOST` | API 서버 base URL | `src/shared/api/index.ts` |
| `EXPO_PUBLIC_AUTHORIZATION_SERVER` | OAuth2 인증 서버 base URL (`/oauth2/authorize`, `/oauth2/token` 등) | `AuthProvider` |
| `EXPO_PUBLIC_AUTHORIZATION_CLIENT_ID` | OAuth2 Client ID | `AuthProvider` |
| `EXPO_PUBLIC_AUTHORIZATION_CLIENT_SECRET` | OAuth2 Client Secret | `AuthProvider` |

> ⚠️ `EXPO_PUBLIC_*` 값은 빌드 시 클라이언트 번들에 포함되므로 **민감한 비밀 값은 저장하지 마세요**. 진짜 비밀 정보는 백엔드 또는 EAS Secret을 통해 관리해야 합니다.
>
> 환경 변수 변경 후에는 캐시를 비우고 서버를 재시작하세요: `yarn start --clear`

### 네이티브 설정 파일

- `google-services.json` 파일을 프로젝트 루트에 위치시켜야 Android 빌드가 가능합니다 (Firebase / 푸시 알림 사용).
- iOS의 경우 `GoogleService-Info.plist`를 추가하고 `app.json`의 `ios` 항목에 등록해주세요.

## 실행

```bash
# Metro 개발 서버 시작
yarn start

# iOS 시뮬레이터에서 실행 (네이티브 빌드 포함)
yarn ios

# Android 에뮬레이터/디바이스에서 실행 (네이티브 빌드 포함)
yarn android

# 웹에서 실행
yarn web
```

> `expo-notifications`, `expo-secure-store` 등 네이티브 모듈이 포함되어 있으므로 **Expo Go**가 아닌 **Development Build**로 실행해야 합니다.

## 스크립트

| Script | 설명 |
| --- | --- |
| `yarn start` | Expo 개발 서버 실행 |
| `yarn ios` | iOS 네이티브 빌드 후 실행 |
| `yarn android` | Android 네이티브 빌드 후 실행 |
| `yarn web` | 웹 모드로 실행 |
| `yarn lint` | ESLint 검사 |
| `yarn prettier` | Prettier 포맷팅 |
| `yarn reset-project` | 스타터 코드를 `app-example`로 이동하고 빈 `app` 디렉토리 생성 |

## 디렉토리 구조

```
src/
├── app/        # expo-router 라우트 (file-based routing)
├── domain/     # 도메인 단위 비즈니스 로직
├── shared/     # 공용 컴포넌트 / 훅 / Provider
├── utils/      # 유틸리티 함수
└── global.css  # Tailwind 글로벌 스타일
```

## 빌드 / 배포 (EAS)

```bash
# EAS CLI 설치
npm i -g eas-cli

# 로그인
eas login

# 빌드
eas build --platform ios
eas build --platform android
```

빌드 프로필은 `eas.json`에서 관리합니다.
