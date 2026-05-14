# AGENTS.md — Zustand Spec Design

- **Date:** 2026-05-14
- **Owner:** hyunwoo4847@gmail.com
- **Status:** Approved for implementation
- **Target file:** `AGENTS.md`

## 1. Goal

Document the project's Zustand convention in `AGENTS.md` so every code
agent produces store code that matches the existing pattern shipped in
commit `7af7c04 feat: zustand 추가`.

Today Zustand is in the codebase (`src/shared/store/rootStore.ts`,
`src/domain/users/store/{slice.ts,users.state.ts}`) and §4.11 already
lists `// store` as a section-comment slot — but `AGENTS.md` never
explains:

- where slice files live,
- what shape they take (`SlicePattern<T,S>` helper, default export,
  `<name>.state.ts` companion),
- how `BoundState` is composed at the root,
- how devtools action names are formatted,
- how selectors must be written (property-level only — no destructuring),
- when to reach for Zustand vs `useState` vs Context,
- what may and may not be persisted to AsyncStorage.

Without this, fresh agent work will drift away from the shipped pattern
on the very next store touch.

## 2. Non-goals

- **Not a refactor of existing store code.** `rootStore.ts`,
  `users/store/*`, and `AuthProvider.tsx`'s mixed `useState` +
  `useStore` usage stay as-is.
- **Not a state-management migration.** Existing `useState` /
  `Context` usages are not converted to Zustand by this change.
- **Not a Persist re-design.** The current `persist({ name:
'template-expo-app', storage: AsyncStorage })` configuration is
  left untouched. The spec only documents rules for what fields are
  allowed inside the persisted slice going forward.
- **Not a `.env` / SecureStore re-architecture.** The spec references
  the existing SecureStore usage in `AuthProvider`; it does not
  prescribe new secret-handling mechanisms.

## 3. Decisions

| #   | Decision                                                                                                                                                           | Rationale                                                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Place the new pattern as **§4.8 Store / Slice Pattern**, right after §4.7 Provider                                                                                 | Matches the `// store` slot's position in §4.11 (after `// context`, before `// hooks`). Data-layer subsections stay grouped (DTO → API → Query → Provider → Store). |
| D2  | Shift current §4.8 → §4.9, §4.9 → §4.10, §4.10 → §4.11, §4.11 → §4.12; update §4.7's `Section Comments per §4.11` pointer to `§4.12`                               | One renumbering pass keeps cross-references intact.                                                                                                                  |
| D3  | Add a single line to §2 Tech Stack: `zustand` (immer + persist + devtools middleware) for client global state                                                      | §2 is the canonical "what's in the stack" list; absence here was the original drift point.                                                                           |
| D4  | Add `src/domain/<name>/store/` (`slice.ts`, `<name>.state.ts`) and `src/shared/store/` (`rootStore.ts`, `types.d.ts`) to the §3 directory tree and Placement rules | §3 is the index agents read to decide where new code goes; store paths must be discoverable there.                                                                   |
| D5  | Mandate property-level selectors only (`useStore((s) => s.x)`); forbid object-destructuring selectors                                                              | Object selectors re-render on every store change. Existing code (`AuthProvider.tsx:78-81`) already follows this. Spec elevates current practice to a rule.           |
| D6  | Standardize devtools action names as `{ type: 'domain/action' }`                                                                                                   | Existing slices use `'user/loggedIn'`, `'user/loggedOut'`. Documenting it prevents free-form names that hurt devtools readability.                                   |
| D7  | Spec includes a "when to use" guide for `useState` vs `Context` vs Zustand, naming `AuthProvider` as an explicit mixed-usage example                               | The user flagged this as in-scope. Without guidance, agents may either over-pull state into the store or duplicate Context.                                          |
| D8  | Persist rule: only non-sensitive UI / metadata fields may live in the persisted store. Tokens and other secrets stay in `SecureStore`. Use `partialize` if needed  | Current `persist` covers the whole store. The rule is forward-looking — new sensitive fields must not be added to slices that are persisted unredacted.              |
| D9  | Strengthen §4.11 (post-shift §4.12) `// store` bullet to spell out the property-level selector rule                                                                | Avoids duplicating the rule in two distant sections.                                                                                                                 |
| D10 | Use the existing `users` slice as the canonical code example in §4.8                                                                                               | Already in-tree, already correct, already referenced from `AuthProvider`. Matches §4.4/§4.5/§4.6 style of "real code from this repo".                                |

## 4. Changes to `AGENTS.md`

### 4.1 §2 Tech Stack — append one bullet

After the existing `dayjs` bullet, add:

```
- `zustand` (immer + persist + devtools middleware) for client global state
```

### 4.2 §3 Directory Structure — extend tree and Placement rules

Extend the directory tree:

```
src/
├── app/                 # (unchanged)
├── domain/              # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/                # HTTP calls + DTOs (`*.ts` + `*.dto.ts`)
│       ├── queries/             # react-query hooks (`*.tsx`)
│       └── store/               # Zustand slice (사용 시에만)
│           ├── slice.ts             # createXxxSlice — SlicePattern<T, BoundState>
│           └── <name>.state.ts      # 도메인 state 타입 정의
├── shared/              # cross-domain shared modules
│   ├── api/
│   ├── providers/
│   ├── loaders/
│   ├── components/
│   ├── dayjs/
│   ├── i18n/
│   ├── store/                   # Zustand root store + type helpers
│   │   ├── rootStore.ts             # useStore (devtools + persist + immer)
│   │   └── types.d.ts               # SlicePattern<T,S> declare module 'zustand'
│   └── queries/
└── utils/
```

Append one bullet to the Placement rules:

```
- 도메인 전역 상태 → `src/domain/<name>/store/`.
  루트 조합/미들웨어 설정 → `src/shared/store/`.
```

### 4.3 New §4.8 Store / Slice Pattern — `domain/<name>/store/*` + `shared/store/rootStore.ts`

Insert this section between the current §4.7 and §4.8 (verbatim — heading included):

#### Heading

`### 4.8 Store / Slice Pattern — domain/<name>/store/* + shared/store/rootStore.ts`

#### Body

- 도메인 전역 상태는 zustand slice 로 관리한다.
- File layout:
  - `src/domain/<name>/store/<name>.state.ts` — slice 의 state + action 타입.
  - `src/domain/<name>/store/slice.ts` — `createXxxSlice` (default export).
  - `src/shared/store/rootStore.ts` — `useStore` (devtools + persist + immer).
  - `src/shared/store/types.d.ts` — `SlicePattern<T,S>` 헬퍼 (immer + devtools middleware baked-in).
- State 타입은 §4.4 처럼 파일 맨 아래 `export type { ... }` 로 노출한다.
- Slice 함수 시그니처는 `SlicePattern<TSlice, BoundState>`. middleware 타입을 매번 다시 쓰지 않도록 헬퍼를 사용한다.
- 모든 `set` 호출은 devtools action name 을 명시한다:
  `set(updater, false, { type: '<domain>/<action>' })`.
  예: `user/loggedIn`, `user/loggedOut`. action 이름은 도메인 prefix + camelCase 동작명.
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
- 새 필드를 slice 에 추가할 때 민감성을 검토하고, 일부만 persist 해야 한다면 `partialize` 로 화이트리스트 한다.
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
import { BoundState } from '@/shared/store/rootStore';

import { SlicePattern } from 'zustand';

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

import createUserSlice from '@/domain/users/store/slice';
import { UserState } from '@/domain/users/store/users.state';

import { create } from 'zustand';
import { createJSONStorage, devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

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

소비자 예시 (선택자만 발췌):

```tsx
// store
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);
const loggedOut = useStore((s) => s.loggedOut);
```

(End of new §4.8 body.)

### 4.4 Renumber existing §4.8 / §4.9 / §4.10 / §4.11 → §4.9 / §4.10 / §4.11 / §4.12

- Current §4.8 Screen Components → §4.9
- Current §4.9 Styling → §4.10
- Current §4.10 Comments → §4.11
- Current §4.11 Section Comments → §4.12

Update every `§4.11` cross-reference inside §4 to `§4.12`. Today these are at:

- §4.7 Provider Pattern — `Group blocks inside the component with **section comments** per §4.11.`
- (post-shift) §4.9 Screen Components — `Section comments follow §4.11.`
- (post-shift) §4.11 Comments — `Permitted: section markers per §4.11, ...`

All three become `§4.12`.

### 4.5 §4.12 (post-shift) — strengthen the `// store` bullet

Replace:

```
4. `// store` — Zustand selector (사용 시에만)
```

with:

```
4. `// store` — Zustand 셀렉터 (`useStore((s) => s.x)`) — 속성 단위 셀렉터만 사용, 객체 분해 셀렉터 금지 (사용 시에만)
```

## 5. Architecture sketch

```
┌──────────────────────────────────────────────────────────────────────┐
│ src/shared/store/rootStore.ts                                        │
│                                                                      │
│   useStore = create<BoundState>()(                                   │
│     devtools(   ← named "template-expo-app", dev-only                │
│       persist( ← AsyncStorage, name "template-expo-app"              │
│         immer( ← updater 안에서 mutate 가능                          │
│           (...a) => ({ ...createUserSlice(...a) })                   │
│ ))))                                                                 │
│                                                                      │
│   BoundState = UserState                                             │
└──────────────────────────────────────────────────────────────────────┘
        ▲                                  ▲
        │ SlicePattern<TSlice, BoundState> │
        │                                  │
┌───────┴────────────────┐   ┌─────────────┴──────────┐
│ src/domain/users/store │   │ (future) src/domain/X/ │
│   slice.ts             │   │   store/slice.ts       │
│   users.state.ts       │   │   X.state.ts           │
└────────────────────────┘   └────────────────────────┘
        ▲
        │ property-level selector
        │
┌───────┴──────────────────────────┐
│ src/shared/providers/auth/       │
│   AuthProvider.tsx               │
│                                  │
│   const userinfo = useStore(     │
│     (s) => s.userinfo);          │
│   const loggedIn = useStore(     │
│     (s) => s.loggedIn);          │
└──────────────────────────────────┘
```

## 6. Implementation steps

1. Edit `AGENTS.md`:
   1. §2 — add `zustand` bullet (4.1).
   2. §3 — extend directory tree and Placement rules (4.2).
   3. Insert new §4.8 Store / Slice Pattern (4.3).
   4. Renumber subsequent subsections; update §4.7 and post-shift §4.9 cross-references to §4.12 (4.4).
   5. Strengthen post-shift §4.12 `// store` bullet (4.5).
2. Run `yarn prettier --check AGENTS.md` (or `yarn prettier --write AGENTS.md` if the project formats markdown).
3. Commit as `docs: AGENTS.md zustand spec 추가`.
4. Open a feature PR from `feature/agents-zustand-spec` → `develop` per §5 branch rules.

## 7. Acceptance criteria

- [ ] `AGENTS.md` §2 lists `zustand` in the stack bullets.
- [ ] §3 directory tree and Placement rules show `src/domain/<name>/store/` and `src/shared/store/`.
- [ ] §4.8 Store / Slice Pattern exists with: file layout, `SlicePattern` usage, devtools action naming, `BoundState` composition, property-level selector rule (with do/don't example), When-to-use table, Persist rules, state/slice/root code examples.
- [ ] All three `§4.11` cross-references inside §4 (Provider, Screen Components, Comments) now read `§4.12`.
- [ ] Post-shift §4.12 `// store` bullet explicitly bans object-destructuring selectors.
- [ ] No other section content is changed beyond renumbering and the targeted cross-reference updates.
- [ ] `yarn prettier` produces no diff for `AGENTS.md`.

## 8. Out-of-scope follow-ups

- Apply `partialize` to the current `persist` configuration if/when a slice adds a field that should not be persisted. The current `users` slice (`userinfo`, `isLoggedIn`) is safe to persist as-is — `UserInfo` already excludes tokens.
- Consider replacing the remaining `useState` blocks in `AuthProvider.tsx` (token / refreshToken / expiredAt) with `SecureStore` reads + a smaller transient state slice. The current mixed pattern is intentionally preserved (see §2 non-goal).
- Add a similar §4.x for shared utility helpers if/when `src/utils/` grows complex enough to warrant convention.
