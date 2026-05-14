# AGENTS.md

> Cross-agent convention document for **template-expo-app**.
> This file governs every code agent (Claude Code, Cursor, Aider, Codex,
> Copilot, etc.) working in this repository. Body is English; Korean is
> used only for 도메인/비지니스 라벨 in examples.

## Precedence

User instructions > `CLAUDE.md` (Claude Code overlay) > `AGENTS.md`.
When this document conflicts with `README.md`, this document wins for
agent behavior; `README.md` remains the human-facing onboarding doc.

---

## 1. Overview

`template-expo-app` is an Expo (React Native) starter with OAuth2 auth,
push notifications, dark mode, i18n, and an animated splash. `AGENTS.md`
defines the coding conventions, directory layout, branch / commit / PR
rules, environment expectations, design-prompt workflow, and quality
gates every agent must follow.

## 2. Tech Stack & Requirements

Pointer to `README.md` for the full table. The decisions that affect
agent code output:

- Expo ~55, React Native 0.83, React 19
- TypeScript (`strict: true`)
- expo-router (file-based, typed routes)
- NativeWind (Tailwind CSS v4)
- `@tanstack/react-query` for server state
- `ky` for HTTP
- `expo-secure-store`, `@react-native-async-storage/async-storage`
- `i18next` + `react-i18next` + `expo-localization`
- `dayjs` (ko locale + duration/relativeTime plugins)
- `zustand` (immer + persist + devtools middleware) for client global state
- Yarn 4 (Berry); Node LTS ≥ 24
- Path alias: `@/*` → `src/*`, `@/assets/*` → `assets/*`

## 3. Directory Structure

```
src/
├── app/                 # expo-router routes (file-based). Screen components only.
│   ├── _layout.tsx              # Root layout (Providers + route guard)
│   ├── login.tsx                # OAuth login screen
│   ├── callback.tsx             # OAuth callback handler
│   ├── +not-found.tsx           # 404
│   ├── global.css               # Tailwind globals
│   └── (tabs)/                  # Tab navigation group
├── domain/              # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/                # HTTP calls + DTOs (`*.ts` + `*.dto.ts`)
│       ├── queries/             # react-query hooks (`*.tsx`)
│       └── store/               # Zustand slice (사용 시에만)
│           ├── slice.ts             # createXxxSlice — SlicePattern<T, BoundState>
│           └── <name>.state.ts      # 도메인 state 타입 정의
├── shared/              # cross-domain shared modules
│   ├── api/                     # ky client + auth header + paging helpers
│   ├── providers/               # Context providers (Auth, I18n, Notification, Theme, RQ)
│   ├── loaders/                 # app loader (Lottie splash)
│   ├── components/              # cross-domain reusable components
│   ├── dayjs/                   # dayjs setup (ko locale, plugins)
│   ├── i18n/                    # i18next setup + locales (ko, en)
│   ├── store/                   # Zustand root store + type helpers
│   │   ├── rootStore.ts             # useStore (devtools + persist + immer)
│   │   └── types.d.ts               # SlicePattern<T,S> declare module 'zustand'
│   └── queries/                 # shared query type defs
└── utils/               # pure utilities (no React/Expo deps)
```

Placement rules:

- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.
- Routes/screens go **only** in `src/app/`.
- 도메인 전역 상태 → `src/domain/<name>/store/`.
  루트 조합/미들웨어 설정 → `src/shared/store/`.

## 4. Coding Conventions

### 4.1 TypeScript

- `strict: true` is mandatory; do not weaken `tsconfig.json`.
- Prefer `interface` for object shapes; `type` for unions/aliases.
- Re-export types at the bottom of the file:

```ts
interface UserDetail {
  /* ... */
}
interface UserRoleDetail {
  /* ... */
}

export type { UserDetail, UserRoleDetail };
```

### 4.2 Naming

| Kind                 | Convention                | Example                                   |
| -------------------- | ------------------------- | ----------------------------------------- |
| File (module)        | camelCase                 | `userNotification.ts`                     |
| File (component)     | PascalCase                | `AuthProvider.tsx`, `Loading.tsx`         |
| DTO file             | `<name>.dto.ts`           | `users.dto.ts`                            |
| Type / Interface     | PascalCase                | `UserDetail`, `PagedModel`                |
| Function             | camelCase, verb-first     | `getUserDetail`, `createUserNotification` |
| React hook           | `use` + PascalCase noun   | `useUserNotifications`                    |
| Constant             | UPPER_SNAKE_CASE          | `KEY_ACCESS_TOKEN`                        |
| Route folder (group) | `(group)` per expo-router | `(tabs)`, `(home)`                        |

도메인/비지니스 라벨 (user-visible 한국어 텍스트, UI 상수)은 한국어로 작성:

```ts
const THEME_OPTIONS = [
  { key: 'light', label: '밝은 모드' },
  { key: 'dark', label: '어두운 모드' },
  { key: 'system', label: '시스템 설정과 같이' },
];
```

### 4.3 Import Order

Group imports with a blank line between groups, in this order:

1. React / `react`
2. `react-native`, `expo-*`
3. Third-party libs (`@tanstack/react-query`, `ky`, `classnames`, `dayjs`, …)
4. Internal `@/` imports
5. Side-effect imports (`'./global.css'`)

Example (from `src/shared/providers/auth/AuthProvider.tsx`):

```ts
import { createContext, useEffect, useMemo, useState } from 'react';

import { fetchUserInfoAsync, makeRedirectUri, refreshAsync } from 'expo-auth-session';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

import { useQueryClient } from '@tanstack/react-query';

import { deleteUserNotificationProvider } from '@/domain/notifications/apis/userNotification';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';
```

### 4.4 DTO Pattern — `*.dto.ts`

- One file per domain (`<domain>.dto.ts`).
- Each shape as `interface` (or `type` for unions).
- Bottom-of-file `export type { ... }` block.

```ts
// src/domain/users/apis/users.dto.ts
import { UserRole } from '@/shared/providers/auth/AuthProvider';

interface UserRoleDetail {
  id: string;
  type: UserRole;
  description?: string;
}

interface UserDetail {
  id: string;
  userId: string;
  username: string;
  role: UserRoleDetail;
  email?: string;
}

export type { UserDetail, UserRoleDetail };
```

### 4.5 API Module Pattern — `domain/<name>/apis/*.ts`

- Import the shared `ky` client as `api` from `@/shared/api`.
- Use `generateAuthHeader(accessToken)` for authenticated calls.
- One exported `async` function per endpoint, action-verb name
  (`get*`, `create*`, `update*`, `delete*`).
- Parameters: positional path params first, then a single object for
  body / auth header.
- Return `.json<DTO>()` — never expose the raw `Response`.

```ts
// src/domain/users/apis/users.ts
import { UserDetail } from '@/domain/users/apis/users.dto';
import api, { generateAuthHeader } from '@/shared/api';
import type { AuthRequestHeader } from '@/shared/api/common.dto';

export async function getUserDetail(id: string, { accessToken }: AuthRequestHeader) {
  return api.get(`api/v1/users/${id}`, { headers: generateAuthHeader(accessToken) }).json<UserDetail>();
}
```

### 4.6 React Query Hook Pattern — `domain/<name>/queries/*.tsx`

- File extension `.tsx` (matches existing convention).
- Hook name: `use<Action><Noun>` (e.g. `useUserNotifications`,
  `useUpdateUserNotification`).
- Query key shape:
  `[<resource>, <id>, <subresource>, <action?>]`,
  e.g. `['users', userUniqueId, 'notifications', 'providers']`.
- Mutation hooks accept a second arg
  `{ onSuccess, onError }: QueryMutationHandle<T>`
  (shared type in `src/shared/queries/types.d.ts`).
- Return an object that renames `mutate`/`isPending` to action-named keys.

```tsx
// src/domain/notifications/queries/userNotification.tsx
export function useUserNotifications({ userUniqueId }: { userUniqueId?: string }) {
  const { data, isLoading } = useQuery<UserNotificationProvider[]>({
    queryKey: ['users', userUniqueId, 'notifications', 'providers'],
    queryFn: () => getUserNotifications({ userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { notificationProviders: data || [], isLoading };
}
```

### 4.7 Provider Pattern — `shared/providers/<name>/<Name>Provider.tsx`

- `default export` is the Provider component.
- Named export the `Context` and any public types.
- Group blocks inside the component with **section comments** per §4.12.
- Wrap the context value with `useMemo`.

Skeleton:

```tsx
export const FooContext = createContext<FooContextProps>({
  /* defaults */
});

export default function FooProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [value, setValue] = useState<string>('');

  // useEffect
  useEffect(() => {
    /* ... */
  }, []);

  // handle
  const handleChange = (next: string) => setValue(next);

  // memorize
  const memorizeValue = useMemo<FooContextProps>(() => ({ value, onChange: handleChange }), [value]);

  return <FooContext value={memorizeValue}>{children}</FooContext>;
}
```

### 4.8 Store / Slice Pattern — `domain/<name>/store/*` + `shared/store/rootStore.ts`

- 도메인 전역 상태는 zustand slice 로 관리한다.
- File layout:
  - `src/domain/<name>/store/<name>.state.ts` — slice 의 state + action 타입.
  - `src/domain/<name>/store/slice.ts` — `createXxxSlice` (default export).
  - `src/shared/store/rootStore.ts` — `useStore` (devtools + persist + immer).
  - `src/shared/store/types.d.ts` — `SlicePattern<T,S>` 헬퍼 (immer + devtools middleware baked-in).
- State 타입은 §4.4 처럼 파일 맨 아래 `export type { ... }` 로 노출한다.
- Slice 함수 시그니처는 `SlicePattern<TSlice, BoundState>`. middleware 타입을 매번 다시 쓰지 않도록 헬퍼를 사용한다.
- 모든 `set` 호출은 devtools action name 을 명시한다: `set(updater, false, { type: '<domain>/<action>' })`. 예: `user/loggedIn`, `user/loggedOut`. action 이름은 도메인 prefix + camelCase 동작명.
- 루트 store 는 모든 slice 를 spread 합성하고 `BoundState` 는 각 slice state 의 intersection (`UserState & FooState`) 이다.
- 셀렉터는 **속성 단위로만** 작성한다. 객체 분해 셀렉터는 사용하지 않는다.

```tsx
// OK
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);

// 금지 — store 가 바뀔 때마다 re-render 됨
const { userinfo, isLoggedIn } = useStore();
```

- §4.12 section-comment 순서에서 `// store` 블록 안에 한 번에 모은다 (`// context` 다음, `// hooks` 앞).

When to use:

| Need                                               | Use                                                           |
| -------------------------------------------------- | ------------------------------------------------------------- |
| Single-component, transient state                  | `useState`                                                    |
| Provider-injected dependency tree                  | `Context` (§4.7)                                              |
| 여러 화면/도메인이 공유하는 일관된 클라이언트 상태 | zustand slice                                                 |
| 서버 데이터                                        | React Query (§4.6) — zustand 에 서버 응답을 미러링하지 않는다 |

`AuthProvider` 처럼 같은 컴포넌트 안에서 `useState` 와 `useStore` 를 섞어 쓰는 것은 허용된다. 화면 외부와 통신하지 않는 transient 값(token timer 등)은 `useState` 에, 여러 곳에서 읽히는 `userinfo` / `isLoggedIn` 은 store 에 둔다.

Persist 규칙:

- `persist` 는 비-민감 정보(UI 설정, 캐시된 메타데이터 등) 에만 적용한다.
- 토큰, refresh token, 기타 secret 은 `expo-secure-store` 에 보관하고 zustand store 에는 평문으로 보관하지 않는다.
- 현재 `rootStore.ts` 는 `partialize` 없이 store 전체를 persist 한다. 새 필드를 slice 에 추가할 때 민감성을 검토하고, 일부만 persist 해야 한다면 `partialize` 로 화이트리스트 한다.
- storage name 은 앱 식별자 (`template-expo-app`) 를 유지한다.

State 파일 예시:

```ts
// src/domain/users/store/users.state.ts
import { UserInfo } from '@/shared/providers/auth/AuthProvider';

type UserState = {
  userinfo?: UserInfo;
  isLoggedIn: boolean;
  loggedIn: (userinfo: UserInfo) => void;
  loggedOut: () => void;
};

export type { UserState };
```

Slice 파일 예시:

```ts
// src/domain/users/store/slice.ts
import { SlicePattern } from 'zustand';

import { BoundState } from '@/shared/store/rootStore';
import { UserState } from './users.state';

const createUserSlice: SlicePattern<UserState, BoundState> = (set) => ({
  isLoggedIn: false,
  loggedIn: (userinfo) => set(() => ({ userinfo, isLoggedIn: true }), false, { type: 'user/loggedIn' }),
  loggedOut: () =>
    set(() => ({ userinfo: undefined, isLoggedIn: false }), false, {
      type: 'user/loggedOut',
    }),
});

export default createUserSlice;
```

루트 store 예시:

```ts
// src/shared/store/rootStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';

export const useStore = create<BoundState>()(
  devtools(
    persist(
      immer((...a) => ({
        ...createUserSlice(...a),
      })),
      { name: 'template-expo-app', storage: createJSONStorage(() => AsyncStorage) },
    ),
    { name: 'template-expo-app', enabled: process.env.NODE_ENV !== 'production' },
  ),
);

export type BoundState = UserState;
```

소비자 예시 (셀렉터만 발췌):

```tsx
// store
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);
const loggedOut = useStore((s) => s.loggedOut);
```

### 4.9 Screen Components — `src/app/**`

- `default export` per route file (expo-router requirement).
- Use NativeWind `className` for styling.
- Conditional classes via `classnames` (`import cx from 'classnames'`).
- Korean text for user-visible 한국어 라벨; English for code identifiers.
- Section comments follow §4.12.

```tsx
<TouchableOpacity
  className={cx('flex flex-row items-center gap-3 px-4 py-4', {
    'bg-black dark:bg-white': theme === option.key,
  })}
  onPress={() => onUpdateTheme(option.key as ThemePreference)}
>
  <Text className="flex-1 text-[15px] font-semibold">{option.label}</Text>
</TouchableOpacity>
```

### 4.10 Styling

- Use NativeWind utility classes; avoid `StyleSheet.create` unless a
  utility cannot express the style.
- Dark mode via the `dark:` prefix (`ThemeProvider` toggles the scheme).
- Tokens / colors come from Tailwind config; do not hard-code hex in JSX
  unless prototyping.

### 4.11 Comments

- Default: write none. Identifier names should carry the meaning.
- Permitted: section markers per §4.12, and one-line Korean comments
  for non-obvious 비지니스 reasoning.
- Never narrate WHAT the code does.

### 4.12 Section Comments

React 컴포넌트, 커스텀 hook (`useXxx.tsx`), shared provider 의 함수
본문은 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는
섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand 셀렉터 (`useStore((s) => s.x)`) — 속성 단위 셀렉터만 사용, 객체 분해 셀렉터 금지 (사용 시에만)
5. `// hooks` — 그 외 커스텀 hook 호출 (`useRouter`, `useColorScheme` 등)
6. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
7. `// useEffect`
8. `// useLayoutEffect`
9. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수
10. `// memorize` — `useMemo`
11. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate
된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다.

표준 예시:

```tsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { View } from 'react-native';

import { useColorScheme } from 'nativewind';

import { useContents } from '@/domain/contents/queries/contents';
import { ContentsContext } from '@/shared/providers/contents/ContentsProvider';

export default function Contents() {
  // ref
  const containerRef = useRef<View>(null);

  // context
  const { contents } = useContext(ContentsContext);

  // state
  const [open, setOpen] = useState<boolean>(false);

  // hooks
  const { colorScheme } = useColorScheme();

  // queries
  const { list, isLoading } = useContents({ size: 10, page: 0 });

  // useEffect
  useEffect(() => {
    // ...
  }, [open]);

  // handle
  const handleClick = () => {
    // ...
  };

  // memorize
  const memoized = useMemo(() => heavy(list), [list]);

  // callback
  const handleSelect = useCallback((id: string) => {
    // ...
  }, []);

  return <View>...</View>;
}
```

기존 파일은 일괄 마이그레이션하지 않는다. 해당 파일을 다른 작업으로
수정할 때 같은 PR 안에서 점진적으로 정리한다.

## 5. Branch Naming Convention

- `master` — production-ready. Releases cut from here.
  - Every release creates a git tag (`vX.Y.Z`) and a GitHub release.
- `develop` — integration branch for the next release.
- `feature/<topic>` — new feature work; branch from `develop`,
  merge back into `develop` via PR.
- `hotfix/<topic>` — urgent fix on a released version; branch from
  `master`, merge into both `master` and `develop`.

Direct push to `master` / `develop` is forbidden — always via PR.

### Rules

- Use lowercase, kebab-case for `<topic>` (e.g., `feature/asset-upload`,
  `hotfix/jwt-scope-mapping`).
- When opening a PR from a `feature/*` branch, the base branch **MUST**
  be `develop`. Targeting `master` directly is not allowed for feature
  work; promotion to `master` happens through a separate `develop` →
  `master` release PR.
- Do not commit directly to `master` or `develop` — always go through a
  PR.
- A tag is created on `master` when a release ships; tag name follows
  the version pattern in §6.

## 6. Commit Message Convention

Lowercase prefix + `:` + concise message.

| Prefix     | Use for                                                          |
| ---------- | ---------------------------------------------------------------- |
| `feat`     | new feature                                                      |
| `refactor` | code restructure without behavior change (rename, extract, etc.) |
| `fix`      | bug or issue fix                                                 |
| `build`    | dependency / package manager changes (yarn, gradle, pods)        |
| `docs`     | documentation or comment changes                                 |
| `test`     | add or modify tests                                              |

Examples (한국어 본문 OK):

```
feat: 사용자 알림 설정 화면 추가
refactor: dto type 관련 전면 수정
fix: 토큰 만료 시 자동 재로그인 안 되던 문제 수정
build: expo SDK 55로 업그레이드
docs: AGENTS.md 추가
test: useUserNotifications 훅 테스트 추가
```

## 7. PR & Versioning

GitHub Actions auto-bumps the version on PR merge. Version pattern:
`[major].[minor].[patch]`.

- PR title contains `[major]` → major + 1
- PR title contains `[minor]` → minor + 1
- Otherwise → patch + 1

PR rules:

- Target branch: usually `develop` (or `master` for hotfix).
- Title must read cleanly as a release-note line.
- Body should describe **why** the change exists, not what the diff shows.

## 8. Environment & Secrets

- `.env` keys (full table in `README.md`):
  - `EXPO_PUBLIC_API_HOST` — exposed to the client bundle.
  - `AUTHORIZATION_HOST`, `AUTHORIZATION_CLIENT_ID`,
    `AUTHORIZATION_CLIENT_SECRET` — **not** prefixed `EXPO_PUBLIC_`;
    surfaced only via `app.config.ts → extra.auth`.
- Native config files required at repo root: `google-services.json`
  (Android), `GoogleService-Info.plist` (iOS).
- Never commit secret-bearing files.
- After changing `.env`, restart Metro with `yarn start --clear`.

## 9. Design Prompt Workflow

**Template location:** `./docs/design/` — every reusable system / UI
design prompt template lives here.

When a user requests UI / design work (목업, 레이아웃 비교, 비주얼 컴포넌트):

1. Check `./docs/design/` for an applicable prompt template **before**
   producing anything new; follow its output style and artifact format.
2. If superpowers brainstorming is in use, propose using the visual
   companion at this step.
3. With user agreement, write static HTML mockups to a **temporary
   directory** (e.g. `/tmp/<topic>-mockup-<date>/`).
4. Start a local HTTP server — `npx serve <dir>` or
   `python3 -m http.server` — and tell the user the URL and port.
5. Iterate based on user feedback. **Only** the final, agreed design
   lands in actual `src/` code.
6. Stop the HTTP server once the design iteration session ends
   (either the user approves the final design or abandons the work).

This workflow is agent-agnostic. Claude Code may additionally use its
Visual Companion (see `CLAUDE.md`); the 6-step workflow above is still
the contract.

## 10. Quality Gates

Before finishing any code change:

- `yarn lint` — must pass.
- `yarn prettier` — must produce no diff (formatting clean).
- For UI-affecting changes, run the app (`yarn ios` / `yarn android`)
  when feasible and verify the change in a simulator.
