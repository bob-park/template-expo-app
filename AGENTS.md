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
│       └── queries/             # react-query hooks (`*.tsx`)
├── shared/              # cross-domain shared modules
│   ├── api/                     # ky client + auth header + paging helpers
│   ├── providers/               # Context providers (Auth, I18n, Notification, Theme, RQ)
│   ├── loaders/                 # app loader (Lottie splash)
│   ├── components/              # cross-domain reusable components
│   ├── dayjs/                   # dayjs setup (ko locale, plugins)
│   ├── i18n/                    # i18next setup + locales (ko, en)
│   └── queries/                 # shared query type defs
└── utils/               # pure utilities (no React/Expo deps)
```

Placement rules:

- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.
- Routes/screens go **only** in `src/app/`.

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
- Group blocks inside the component with **Korean section comments**:
  `// state`, `// context`, `// hooks`, `// queries`, `// useEffect`,
  `// handle`, `// memorize`.
- Wrap the context value with `useMemo`.

Skeleton:

```tsx
export const FooContext = createContext<FooContextProps>({
  /* defaults */
});

export default function FooProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [value, setValue] = useState<string>('');

  // context
  // hooks
  // queries
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

### 4.8 Screen Components — `src/app/**`

- `default export` per route file (expo-router requirement).
- Use NativeWind `className` for styling.
- Conditional classes via `classnames` (`import cx from 'classnames'`).
- Korean text for user-visible 한국어 라벨; English for code identifiers.

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

### 4.9 Styling

- Use NativeWind utility classes; avoid `StyleSheet.create` unless a
  utility cannot express the style.
- Dark mode via the `dark:` prefix (`ThemeProvider` toggles the scheme).
- Tokens / colors come from Tailwind config; do not hard-code hex in JSX
  unless prototyping.

### 4.10 Comments

- Default: write none. Identifier names should carry the meaning.
- Permitted: section markers inside Providers (see §4.7), and one-line
  Korean comments for non-obvious 비지니스 reasoning.
- Never narrate WHAT the code does.

### 4.11 Section Comments

React 컴포넌트, 커스텀 hook (`useXxx.tsx`), shared provider 의 함수
본문은 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는
섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
5. `// useEffect`
6. `// useLayoutEffect`
7. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수
8. `// memorize` — `useMemo`
9. `// callback` — `useCallback`

같은 섹션 안에서는 여러 줄을 자유롭게 작성한다. 같은 파일에 co-locate
된 sub-component (예: `UserList.tsx` 의 `UserItem`) 도 동일 규칙을 따른다.

표준 예시:

```tsx
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { View } from 'react-native';

import { useContents } from '@/domain/contents/queries/contents';
import { ContentsContext } from '@/shared/providers/contents/ContentsProvider';

export default function Contents() {
  // ref
  const containerRef = useRef<View>(null);

  // context
  const { contents } = useContext(ContentsContext);

  // state
  const [open, setOpen] = useState<boolean>(false);

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
