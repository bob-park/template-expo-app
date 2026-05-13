# Agent / Claude Code Convention Docs — Design Spec

- **Date:** 2026-05-13
- **Topic:** Author `AGENTS.md` (cross-agent code & workflow convention) and `CLAUDE.md` (Claude Code overlay)
- **Status:** Approved (pending user spec review)

---

## 1. Goal

Produce two living convention documents for this Expo template repo so that any
code agent (Claude Code, Cursor, Aider, Codex, etc.) can pick up the project
and follow the same code style, branch / commit / PR rules, and design-prompt
workflow.

- `AGENTS.md` — shared convention, English body, Korean for 도메인/비지니스 맥락.
- `CLAUDE.md` — Claude Code-specific overlay; imports `AGENTS.md` via `@AGENTS.md`.

## 2. Non-Goals

- Rewriting `README.md`.
- Changing any source code under `src/`.
- Introducing new lint / format rules; the existing `@bob-park/eslint-config-bobpark`
  and `@bob-park/prettier-config-bobpark` remain the source of truth.
- Adding CI workflows beyond what already exists.

## 3. File Layout

```
.
├── AGENTS.md            # NEW — full convention doc (English body)
├── CLAUDE.md            # REWRITE — imports AGENTS.md + Claude Code overlay
└── docs/
    ├── design/          # existing — design prompt templates land here
    └── superpowers/
        └── specs/
            └── 2026-05-13-agent-conventions-design.md  # this file
```

## 4. `AGENTS.md` — Section Plan

Style: English prose, bullet-heavy, **comprehensive** depth — include short
(5–15 line) code snippets pulled from real files. Korean only for
도메인/비지니스 라벨 in examples (matching current code style).

### 4.1 Overview

- One paragraph: this is an Expo (React Native) template; this file defines
  the conventions every code agent must follow when modifying the repo.
- Precedence note: user instructions > `CLAUDE.md` (Claude-specific) > `AGENTS.md`.

### 4.2 Tech Stack & Requirements

Condensed pointer to `README.md` (do not duplicate). Mention only what
affects code decisions:

- Expo ~55, React Native 0.83, React 19, TypeScript strict
- expo-router (file-based, typed routes)
- NativeWind (Tailwind v4) for styling
- `@tanstack/react-query` for server state
- `ky` for HTTP
- Yarn 4 (Berry), Node LTS ≥ 24
- Path alias: `@/*` → `src/*`, `@/assets/*` → `assets/*`

### 4.3 Directory Structure

Annotated tree showing the role of each folder:

```
src/
├── app/         # expo-router routes (file-based). Screen components only.
├── domain/      # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/        # HTTP calls + DTOs (*.ts + *.dto.ts)
│       └── queries/     # react-query hooks (*.tsx)
├── shared/      # cross-domain shared modules
│   ├── api/             # ky client + auth header helper + paging helpers
│   ├── providers/       # Context providers (Auth, I18n, Notification, Theme, RQ)
│   ├── loaders/         # app loader (Lottie splash)
│   ├── components/      # cross-domain reusable components
│   ├── dayjs/           # dayjs setup (ko locale + plugins)
│   ├── i18n/            # i18next setup + locales (ko, en)
│   └── queries/         # shared query type definitions
└── utils/       # pure utility functions (no React/Expo deps)
```

Rules:

- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.

### 4.4 Coding Conventions

#### 4.4.1 TypeScript

- `strict: true` is mandatory; do not weaken.
- Prefer `interface` for object shapes, `type` for unions/aliases.
- Re-export types at the bottom of the file:

```ts
interface UserDetail { /* ... */ }
interface UserRoleDetail { /* ... */ }

export type { UserDetail, UserRoleDetail };
```

#### 4.4.2 Naming

| Kind                  | Convention                                    | Example                                |
|-----------------------|-----------------------------------------------|----------------------------------------|
| File (module)         | camelCase                                     | `userNotification.ts`                  |
| File (component)      | PascalCase                                    | `AuthProvider.tsx`, `Loading.tsx`      |
| DTO file              | `<name>.dto.ts`                               | `users.dto.ts`                         |
| Type / Interface      | PascalCase                                    | `UserDetail`, `PagedModel`             |
| Function              | camelCase, verb-first                         | `getUserDetail`, `createUserNotification` |
| React hook            | `use` + PascalCase noun                       | `useUserNotifications`                 |
| Constant              | UPPER_SNAKE_CASE                              | `KEY_ACCESS_TOKEN`                     |
| Route folder (group)  | `(group)` per expo-router                     | `(tabs)`, `(home)`                     |

도메인/비지니스 라벨 (사용자에게 보이는 텍스트, 한국어 UI 상수)은 한국어로 작성:

```ts
const THEME_OPTIONS = [
  { key: 'light',  label: '밝은 모드' },
  { key: 'dark',   label: '어두운 모드' },
  { key: 'system', label: '시스템 설정과 같이' },
];
```

#### 4.4.3 Import Order

Group imports with a blank line between groups, in this order:

1. React / `react`
2. `react-native`, `expo-*`
3. Third-party libs (`@tanstack/react-query`, `ky`, `classnames`, `dayjs`, …)
4. Internal `@/` imports
5. Side-effect imports (`'./global.css'`)

Example from `src/app/_layout.tsx`:

```ts
import { useContext } from 'react';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import '@/app/global.css';
import AnimateAppLoader from '@/shared/loaders/app/AnimateAppLoader';
import AuthProvider, { AuthContext } from '@/shared/providers/auth/AuthProvider';

import { useColorScheme } from 'nativewind';
```

#### 4.4.4 DTO Pattern (`*.dto.ts`)

- One file per domain (`<domain>.dto.ts`).
- Declare each type as `interface` (or `type` for unions).
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

#### 4.4.5 API Module Pattern (`domain/<name>/apis/*.ts`)

- Import the shared `ky` client as `api` from `@/shared/api`.
- Use `generateAuthHeader(accessToken)` for authenticated calls.
- One exported async function per endpoint, named after the action
  (`get* / create* / update* / delete*`).
- Parameters: positional path params first, then a single object for
  body / auth header.
- Return `.json<DTO>()` — never expose the raw `Response`.

```ts
// src/domain/users/apis/users.ts
import { UserDetail } from '@/domain/users/apis/users.dto';
import api, { generateAuthHeader } from '@/shared/api';
import type { AuthRequestHeader } from '@/shared/api/common.dto';

export async function getUserDetail(
  id: string,
  { accessToken }: AuthRequestHeader,
) {
  return api
    .get(`api/v1/users/${id}`, { headers: generateAuthHeader(accessToken) })
    .json<UserDetail>();
}
```

#### 4.4.6 React Query Hook Pattern (`domain/<name>/queries/*.tsx`)

- File extension `.tsx` (matches existing convention).
- Hook name: `use<Action><Noun>` (e.g. `useUserNotifications`,
  `useUpdateUserNotification`).
- Query key shape: `[<resource>, <id>, <subresource>, <action?>]`
  e.g. `['users', userUniqueId, 'notifications', 'providers']`.
- Mutation hooks accept a second arg `{ onSuccess, onError }: QueryMutationHandle<T>`
  (shared type in `src/shared/queries/types.d.ts`).
- Return an object that renames `mutate`/`isPending` to action-named keys:

```ts
export function useUserNotifications({ userUniqueId }: { userUniqueId?: string }) {
  const { data, isLoading } = useQuery<UserNotificationProvider[]>({
    queryKey: ['users', userUniqueId, 'notifications', 'providers'],
    queryFn: () => getUserNotifications({ userUniqueId: userUniqueId || '' }),
    enabled: !!userUniqueId,
  });

  return { notificationProviders: data || [], isLoading };
}
```

#### 4.4.7 Provider Pattern (`shared/providers/<name>/<Name>Provider.tsx`)

- `default export` is the Provider component.
- Named export the `Context` and any public types.
- Use **Korean section comments** to group blocks inside the component:
  `// state`, `// context`, `// hooks`, `// queries`, `// useEffect`,
  `// handle`, `// memorize`.
- Wrap the context value with `useMemo`.

Skeleton:

```tsx
export const FooContext = createContext<FooContextProps>({ /* defaults */ });

export default function FooProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  // state
  const [value, setValue] = useState<string>('');

  // context
  // hooks
  // queries
  // useEffect
  useEffect(() => { /* ... */ }, []);

  // handle
  const handleChange = (next: string) => setValue(next);

  // memorize
  const memorizeValue = useMemo<FooContextProps>(
    () => ({ value, onChange: handleChange }),
    [value],
  );

  return <FooContext value={memorizeValue}>{children}</FooContext>;
}
```

#### 4.4.8 Screen Components (`src/app/**`)

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

#### 4.4.9 Styling

- Use NativeWind utility classes; avoid `StyleSheet.create` unless a utility
  cannot express the style.
- Dark mode via `dark:` prefix (`ThemeProvider` toggles the scheme).
- Tokens / colors come from Tailwind config; do not hard-code hex in JSX
  unless prototyping.

#### 4.4.10 Comments

- Default: write none. Identifier names should carry the meaning.
- Permitted: section markers inside Providers (see 4.4.7), and one-line
  Korean comments for non-obvious business reasoning.
- Never narrate WHAT the code does.

### 4.5 Branch Naming Convention

- `master` — production-ready. Releases cut from here.
  - Every release creates a **git tag** (`vX.Y.Z`) and a **GitHub release**.
- `develop` — integration branch for the next release.
- `feature/<short-slug>` — new feature work; branched from `develop`,
  merged back into `develop` via PR.
- `hotfix/<short-slug>` — urgent fix on a released version; branched from
  `master`, merged into both `master` and `develop`.

Direct push to `master` / `develop` is forbidden — always via PR.

### 4.6 Commit Message Convention

Prefix-based, lowercase prefix + `:` + concise message:

| Prefix     | Use for                                                            |
|------------|--------------------------------------------------------------------|
| `feat`     | new feature                                                        |
| `refactor` | code restructure without behavior change (rename, extract, etc.)   |
| `fix`      | bug or issue fix                                                   |
| `build`    | dependency / package manager changes (yarn, gradle, pods)          |
| `docs`     | documentation or comment changes                                   |
| `test`     | add or modify tests                                                |

Examples (한국어 본문 OK, 도메인 맥락 표현):

```
feat: 사용자 알림 설정 화면 추가
refactor: dto type 관련 전면 수정
fix: 토큰 만료 시 자동 재로그인 안 되던 문제 수정
build: expo SDK 55로 업그레이드
docs: AGENTS.md 추가
test: useUserNotifications 훅 테스트 추가
```

### 4.7 PR & Versioning

GitHub Actions auto-bumps the version on PR merge. Version pattern:
`[major].[minor].[patch]`.

- PR title contains `[major]` → major + 1
- PR title contains `[minor]` → minor + 1
- Otherwise → patch + 1

PR rules:

- Target branch: usually `develop` (or `master` for hotfix).
- Title must be readable as a release note line.
- Body should describe **why** the change exists, not what the diff shows.

### 4.8 Environment & Secrets

- `.env` keys (see README for the full table):
  - `EXPO_PUBLIC_API_HOST` — exposed to the client bundle.
  - `AUTHORIZATION_HOST`, `AUTHORIZATION_CLIENT_ID`,
    `AUTHORIZATION_CLIENT_SECRET` — **not** prefixed `EXPO_PUBLIC_`,
    surfaced only via `app.config.ts → extra.auth`.
- Native config files (`google-services.json`, `GoogleService-Info.plist`)
  are required at the repo root for Android / iOS builds.
- Never commit secret-bearing files.
- After changing `.env`, restart Metro with `yarn start --clear`.

### 4.9 Design Prompt Workflow

**Template location:** `./docs/design/` — every reusable system/UI design
prompt template lives here.

When a user requests UI / design work (목업, 레이아웃 비교, 비주얼 컴포넌트):

1. Check `./docs/design/` for an applicable prompt template **before**
   producing anything new; follow its output style and artifact format.
2. If brainstorming (superpowers) is in use, propose using the **visual
   companion** in this step.
3. With user agreement, write static HTML mockups to a **temporary
   directory** (e.g. `/tmp/<topic>-mockup-<date>/`).
4. Start a local HTTP server — `npx serve <dir>` or `python3 -m http.server`
   — and tell the user the URL and port.
5. Iterate based on user feedback. **Only** the final, agreed design lands
   in actual `src/` code.
6. Stop the HTTP server once the design iteration session ends (either the
   user approves the final design or abandons the work).

This workflow is agent-agnostic. Claude Code may additionally use the
Visual Companion (see `CLAUDE.md`); the 6-step workflow above is still the
contract.

### 4.10 Quality Gates

Before finishing any code change, run:

- `yarn lint` — must pass.
- `yarn prettier` — must produce no diff.
- For UI-affecting changes, manually run the app (`yarn ios` / `yarn android`)
  when feasible and verify the change in a simulator.

---

## 5. `CLAUDE.md` — Section Plan

Short Claude Code-specific overlay; imports the full convention via the
existing `@AGENTS.md` directive.

### 5.1 Structure

```md
# CLAUDE.md

@AGENTS.md

## Claude Code 전용 규칙

### Plan Mode
- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션)은 plan mode 로 진행한다.

### Superpowers Skill 사용
- 작업 시작 전 관련 superpowers 스킬(brainstorming / writing-plans /
  systematic-debugging 등) 적용 여부를 확인한다.
- 다단계 작업은 TodoWrite(Task) 로 진행 상황을 추적한다.

### Subagent 권고
- 광범위 코드 탐색 → `Explore` subagent.
- 큰 변경의 구현 계획 → `Plan` subagent.
- 독립적인 병렬 작업 → 단일 메시지에 여러 Agent 호출.

### Visual Companion
- AGENTS.md §4.9 디자인 워크플로우를 Claude Code 에서 실행할 때, 시각
  자료가 필요한 단계에 한해 Visual Companion 사용을 제안할 수 있다.
- AGENTS.md 의 6단계 워크플로우(템플릿 확인 → 목업 → 로컬 서버 → 피드백
  → src 반영 → 서버 정리)가 우선한다.

### 금지 사항
- 사용자 명시 없이 `git push --force`, 브랜치 삭제, `git reset --hard` 금지.
- `master` / `develop` 직접 push 금지 (PR 경유).
- 사용자 명시 없이 secret-bearing 파일(`.env`, `google-services.json`,
  `GoogleService-Info.plist`) 변경/커밋 금지.
```

### 5.2 Why this structure

- `@AGENTS.md` makes Claude Code inherit the full convention without
  duplicating content.
- Claude Code-specific additions are short and orthogonal to AGENTS.md.
- Forbidden actions are explicit to prevent destructive operations during
  agent runs.

---

## 6. Acceptance Criteria

- [ ] `AGENTS.md` exists at repo root with all sections in §4.
- [ ] `CLAUDE.md` exists at repo root, imports `AGENTS.md`, and contains
      Claude-specific overlay in §5.
- [ ] Both files are committed with a `docs:` prefix.
- [ ] No source code under `src/` is modified.
- [ ] `yarn lint` and `yarn prettier` are still clean (no impact expected,
      but verified).
- [ ] Code snippets in `AGENTS.md` match the actual current code in `src/`
      (paths and identifiers).

## 7. Open Questions

None at this time. (Resolved during brainstorming: comprehensive depth with
code examples; design workflow placed in `AGENTS.md`.)

## 8. Implementation Sketch

Three commits, in order:

1. `docs: add AGENTS.md cross-agent convention doc`
2. `docs: rewrite CLAUDE.md to import AGENTS.md and add Claude-specific rules`
3. (none needed) — `docs/design/` already exists.

After implementation, hand off to user for a smoke read of both files.
