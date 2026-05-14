# AGENTS.md Zustand Spec Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AGENTS.md 에 zustand convention 을 추가하여, 모든 코드 에이전트가 commit `7af7c04 feat: zustand 추가` 로 들어온 store 패턴(`SlicePattern<T,S>`, devtools action 네이밍, 속성 단위 셀렉터, persist 규칙)을 일관되게 따르도록 만든다.

**Architecture:** 단일 파일(`AGENTS.md`) 편집. §2 한 줄, §3 디렉터리 트리 + Placement rule, §4.8 신설(Store/Slice Pattern), 기존 §4.8–§4.11 → §4.9–§4.12 시프트, 세 곳의 `§4.11` cross-reference → `§4.12`, post-shift §4.12 `// store` 항목 강화.

**Tech Stack:** Markdown 편집만. 검증은 `grep`, `yarn prettier --check`, `yarn lint`. `develop` 브랜치는 prettier/lint 가 markdown 도 처리하므로 변경 후 둘 다 통과해야 한다.

**Spec:** [`docs/superpowers/specs/2026-05-14-agents-zustand-spec-design.md`](../specs/2026-05-14-agents-zustand-spec-design.md)

---

## Pre-flight: feature branch 분기

`AGENTS.md §5` 에 따라 `master` / `develop` 로 직접 push 가 금지되므로, 작업은 feature 브랜치에서 진행한다.

- [ ] **Step 1: 현재 브랜치 / 작업 상태 확인**

```bash
git status --short
git rev-parse --abbrev-ref HEAD
```

Expected: `master` 또는 빈 worktree. 다른 미커밋 변경이 있으면 먼저 정리한다.

- [ ] **Step 2: feature 브랜치 생성**

```bash
git checkout -b feature/agents-zustand-spec
```

Expected: `Switched to a new branch 'feature/agents-zustand-spec'`.

---

## Task 1: §2 Tech Stack — `zustand` 한 줄 추가

**Files:**

- Modify: `AGENTS.md` (§2 Tech Stack, `dayjs` bullet 뒤)

- [ ] **Step 1: 변경 전 §2 상태 확인**

```bash
grep -n "^- " AGENTS.md | head -20
```

Expected: `dayjs` bullet 이 보이고 zustand 는 없음.

- [ ] **Step 2: bullet 삽입 — Edit 사용**

Use the Edit tool on `AGENTS.md`:

`old_string`:

````
- `dayjs` (ko locale + duration/relativeTime plugins)
- Yarn 4 (Berry); Node LTS ≥ 24
````

`new_string`:

````
- `dayjs` (ko locale + duration/relativeTime plugins)
- `zustand` (immer + persist + devtools middleware) for client global state
- Yarn 4 (Berry); Node LTS ≥ 24
````

- [ ] **Step 3: 검증**

```bash
grep -n "zustand" AGENTS.md
```

Expected: §2 영역 (대략 line 38 부근) 에 한 줄 매치.

---

## Task 2: §3 Directory Structure — 트리 + Placement rules 갱신

**Files:**

- Modify: `AGENTS.md` (§3, directory tree 및 Placement rules)

- [ ] **Step 1: 변경 전 트리 확인**

```bash
sed -n '40,75p' AGENTS.md
```

Expected: 현재 `domain/<name>/` 아래 `apis/`, `queries/` 만 있고 `store/` 없음. `shared/` 아래 `store/` 없음.

- [ ] **Step 2: domain 트리에 store/ 추가 — Edit**

`old_string`:

````
├── domain/              # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/                # HTTP calls + DTOs (`*.ts` + `*.dto.ts`)
│       └── queries/             # react-query hooks (`*.tsx`)
````

`new_string`:

````
├── domain/              # business/도메인 modules. One folder per domain.
│   └── <name>/
│       ├── apis/                # HTTP calls + DTOs (`*.ts` + `*.dto.ts`)
│       ├── queries/             # react-query hooks (`*.tsx`)
│       └── store/               # Zustand slice (사용 시에만)
│           ├── slice.ts             # createXxxSlice — SlicePattern<T, BoundState>
│           └── <name>.state.ts      # 도메인 state 타입 정의
````

- [ ] **Step 3: shared 트리에 store/ 추가 — Edit**

`old_string`:

````
│   ├── i18n/                    # i18next setup + locales (ko, en)
│   └── queries/                 # shared query type defs
````

`new_string`:

````
│   ├── i18n/                    # i18next setup + locales (ko, en)
│   ├── store/                   # Zustand root store + type helpers
│   │   ├── rootStore.ts             # useStore (devtools + persist + immer)
│   │   └── types.d.ts               # SlicePattern<T,S> declare module 'zustand'
│   └── queries/                 # shared query type defs
````

- [ ] **Step 4: Placement rules 에 한 줄 추가 — Edit**

`old_string`:

````
- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.
- Routes/screens go **only** in `src/app/`.
````

`new_string`:

````
- A new business domain → new folder under `src/domain/<name>/`.
- Cross-domain reusable code → `src/shared/`.
- Pure helpers with no framework deps → `src/utils/`.
- Routes/screens go **only** in `src/app/`.
- 도메인 전역 상태 → `src/domain/<name>/store/`.
  루트 조합/미들웨어 설정 → `src/shared/store/`.
````

- [ ] **Step 5: 검증**

```bash
grep -n "store/" AGENTS.md
```

Expected: §3 트리에 2개 위치(domain, shared) + Placement rules 2줄 매치.

---

## Task 3: §4.8 신설 — Store / Slice Pattern

기존 §4.7 (Provider Pattern) 본문 끝과 기존 §4.8 (Screen Components) 헤딩 사이에 새 §4.8 섹션을 삽입한다.

**Files:**

- Modify: `AGENTS.md` (`### 4.7 Provider Pattern` 끝 코드 블록 뒤)

- [ ] **Step 1: 삽입 지점 확인**

```bash
grep -n "^### 4\.[78]" AGENTS.md
```

Expected: `### 4.7 Provider Pattern — ...` 와 `### 4.8 Screen Components — \`src/app/**\`` 두 줄 매치.

- [ ] **Step 2: 새 §4.8 섹션 삽입 — Edit**

`old_string` (기존 §4.7 의 닫는 ```` ``` ```` 와 §4.8 헤딩 사이를 포함):

````
  return <FooContext value={memorizeValue}>{children}</FooContext>;
}
```

### 4.8 Screen Components — `src/app/**`
````

`new_string`:

````
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

| Need                                                | Use                                                              |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| Single-component, transient state                   | `useState`                                                       |
| Provider-injected dependency tree                   | `Context` (§4.7)                                                 |
| 여러 화면/도메인이 공유하는 일관된 클라이언트 상태  | zustand slice                                                    |
| 서버 데이터                                         | React Query (§4.6) — zustand 에 서버 응답을 미러링하지 않는다     |

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
  loggedIn: (userinfo) =>
    set(() => ({ userinfo, isLoggedIn: true }), false, { type: 'user/loggedIn' }),
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

소비자 예시 (셀렉터만 발췌):

```tsx
// store
const userinfo = useStore((s) => s.userinfo);
const isLoggedIn = useStore((s) => s.isLoggedIn);
const loggedIn = useStore((s) => s.loggedIn);
const loggedOut = useStore((s) => s.loggedOut);
```

### 4.9 Screen Components — `src/app/**`
````

> **주의:** `new_string` 의 마지막 줄은 기존 §4.8 헤딩을 §4.9 로 미리 갱신한 형태다. 즉 Task 3 한 번으로 §4.8 신설 + 첫 번째 renumbering 이 동시 처리된다. Task 4 는 §4.9 → §4.10, §4.10 → §4.11, §4.11 → §4.12 만 남는다.

- [ ] **Step 3: 검증**

```bash
grep -n "^### 4\." AGENTS.md
```

Expected: 다음 헤딩 시퀀스 — 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8(Store / Slice Pattern), 4.9(Screen Components), 4.9(Styling — 아직 안 옮김), 4.10(Comments — 아직 안 옮김), 4.11(Section Comments — 아직 안 옮김).

> Step 3 의 grep 결과에서 같은 번호가 두 번 나오는 것은 Task 4 에서 곧 해결된다.

---

## Task 4: 남은 헤딩 시프트 — §4.9 → §4.10, §4.10 → §4.11, §4.11 → §4.12

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: §4.9 Styling → §4.10 Styling — Edit**

`old_string`:

````
### 4.9 Styling
````

`new_string`:

````
### 4.10 Styling
````

- [ ] **Step 2: §4.10 Comments → §4.11 Comments — Edit**

`old_string`:

````
### 4.10 Comments
````

`new_string`:

````
### 4.11 Comments
````

- [ ] **Step 3: §4.11 Section Comments → §4.12 Section Comments — Edit**

`old_string`:

````
### 4.11 Section Comments
````

`new_string`:

````
### 4.12 Section Comments
````

- [ ] **Step 4: 헤딩 시퀀스 검증**

```bash
grep -n "^### 4\." AGENTS.md
```

Expected: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8 (Store / Slice Pattern), 4.9 (Screen Components), 4.10 (Styling), 4.11 (Comments), 4.12 (Section Comments). 중복 번호 없음.

---

## Task 5: 세 곳의 `§4.11` cross-reference → `§4.12`

§4.7 Provider, §4.9 Screen Components, §4.11 Comments 안에 남은 `§4.11` 참조 3 곳을 갱신.

**Files:**

- Modify: `AGENTS.md`

- [ ] **Step 1: 변경 전 매치 확인**

```bash
grep -n "§4\.11" AGENTS.md
```

Expected: 정확히 3개 매치 (Provider/Screen Components/Comments 본문 내 cross-reference). §4.12 헤딩 자체는 `4.12` 이므로 매치되지 않는다.

- [ ] **Step 2: §4.7 Provider — Edit**

`old_string`:

````
- Group blocks inside the component with **section comments** per §4.11.
````

`new_string`:

````
- Group blocks inside the component with **section comments** per §4.12.
````

- [ ] **Step 3: §4.9 Screen Components — Edit**

`old_string`:

````
- Section comments follow §4.11.
````

`new_string`:

````
- Section comments follow §4.12.
````

- [ ] **Step 4: §4.11 Comments — Edit**

`old_string`:

````
- Permitted: section markers per §4.11, and one-line Korean comments
````

`new_string`:

````
- Permitted: section markers per §4.12, and one-line Korean comments
````

- [ ] **Step 5: 변경 후 검증**

```bash
grep -n "§4\.11" AGENTS.md
grep -n "§4\.12" AGENTS.md
```

Expected: `§4.11` 은 0 매치. `§4.12` 는 3 매치 (Provider, Screen Components, Comments).

---

## Task 6: post-shift §4.12 `// store` 항목 강화

`// store` 항목에 속성 단위 셀렉터 강제 + 객체 분해 금지 규칙을 추가.

**Files:**

- Modify: `AGENTS.md` (§4.12 Section Comments 번호 목록 내 4번 항목)

- [ ] **Step 1: 변경 전 확인**

```bash
grep -n "// store" AGENTS.md
```

Expected: 한 줄 매치 — `4. \`// store\` — Zustand selector (사용 시에만)`.

- [ ] **Step 2: 강화 — Edit**

`old_string`:

````
4. `// store` — Zustand selector (사용 시에만)
````

`new_string`:

````
4. `// store` — Zustand 셀렉터 (`useStore((s) => s.x)`) — 속성 단위 셀렉터만 사용, 객체 분해 셀렉터 금지 (사용 시에만)
````

- [ ] **Step 3: 검증**

```bash
grep -n "// store" AGENTS.md
```

Expected: 한 줄 매치, 본문에 `속성 단위`, `객체 분해 셀렉터 금지` 포함.

---

## Task 7: 전체 검증 + format + commit

**Files:**

- Read-only verification: `AGENTS.md`

- [ ] **Step 1: spec acceptance criteria 일괄 점검**

```bash
echo "=== §2 zustand bullet ==="
grep -n "zustand" AGENTS.md | head -5

echo "=== §3 store/ paths ==="
grep -n "store/" AGENTS.md

echo "=== §4 headings ==="
grep -n "^### 4\." AGENTS.md

echo "=== leftover §4.11 ==="
grep -n "§4\.11" AGENTS.md

echo "=== §4.12 cross-refs ==="
grep -n "§4\.12" AGENTS.md

echo "=== // store bullet ==="
grep -n "// store" AGENTS.md
```

Expected:

- zustand: §2 본문에 한 줄, §4.8 본문 안에 여러 곳.
- store/: 트리 2개, Placement rules 2 줄, §4.8 본문 다수.
- 4.x 헤딩: 1–12 까지 빠짐 없이.
- §4.11: 0 매치 (헤딩은 4.12 가 됐고 cross-ref 도 모두 갱신).
- §4.12: 정확히 3 매치.
- `// store`: `속성 단위` / `객체 분해` 단어 포함.

- [ ] **Step 2: prettier 포맷 점검**

```bash
yarn prettier --check AGENTS.md
```

Expected: `All matched files use Prettier code style!`. 만약 `Code style issues found` 면 다음을 실행:

```bash
yarn prettier --write AGENTS.md
```

그리고 다시 `--check`. 변경된 라인이 의도와 다르면 (예: 코드 블록 들여쓰기가 깨지면) Edit 으로 되돌리고 fence 문자를 점검한다.

- [ ] **Step 3: lint**

```bash
yarn lint
```

Expected: 0 errors (AGENTS.md 는 lint 가 가볍게 통과한다. 실패하면 메시지 그대로 보고).

- [ ] **Step 4: diff 검토**

```bash
git diff --stat AGENTS.md
git diff AGENTS.md | head -200
```

Expected: 변경 라인이 §2, §3, §4.7 cross-ref, §4.8 신설(약 95 줄 +), §4.9–§4.12 헤딩, §4.12 cross-ref, `// store` 항목에 집중. 다른 섹션(§1 / §5–§10) 은 변경 없음.

- [ ] **Step 5: 커밋**

```bash
git add AGENTS.md
git commit -m "$(cat <<'EOF'
docs: AGENTS.md zustand spec 추가

§2 Tech Stack 에 zustand 한 줄, §3 디렉터리 트리/Placement rules 갱신,
§4.8 Store / Slice Pattern 신설, 기존 §4.8-§4.11 → §4.9-§4.12 시프트
및 cross-reference 갱신, §4.12 // store 항목 강화.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

Expected: 1 file changed, 약 +95 / -5 라인 (정확한 수치는 prettier 결과에 따라 변동 가능).

- [ ] **Step 6: 최종 상태 확인**

```bash
git status --short
git log -1 --format='%h %s'
```

Expected: working tree clean, 가장 최근 커밋이 `docs: AGENTS.md zustand spec 추가`.

---

## Post-plan: PR 생성 (사용자 확인 후)

`AGENTS.md §5` 에 따라 `master` / `develop` 직접 push 금지. 모든 변경은 PR 경유. 이 step 은 사용자가 명시적으로 요청할 때만 실행한다 (PR 생성은 외부 가시 액션이므로 자동화하지 않는다).

명령 예시 (사용자 승인 후):

```bash
git push -u origin feature/agents-zustand-spec
gh pr create --base develop --title "docs: AGENTS.md zustand spec 추가" --body "$(cat <<'EOF'
## Summary
- §2 Tech Stack 에 zustand 추가
- §3 directory tree 와 Placement rules 에 store/ 경로 반영
- §4.8 Store / Slice Pattern 신설 — SlicePattern<T,S>, devtools action 네이밍, BoundState 합성, 속성 단위 셀렉터 강제, When-to-use, Persist 규칙, 코드 예시
- §4.8–§4.11 → §4.9–§4.12 시프트, 세 곳의 §4.11 cross-reference 갱신
- §4.12 // store 항목 강화 (속성 단위 셀렉터 강제, 객체 분해 금지)

## Why
Commit 7af7c04 으로 zustand 가 도입됐지만 컨벤션이 문서화되지 않아, 이후 작업에서 패턴 드리프트가 발생할 위험이 있어 정리.

## Test plan
- [x] yarn prettier --check AGENTS.md
- [x] yarn lint
- [ ] 리뷰어가 §4.8 코드 예시가 src/ 실제 구현과 일치하는지 확인
EOF
)"
```

`develop` 브랜치가 원격에 없으면 base 를 `master` 로 바꾸거나, 먼저 `develop` 를 생성한다 (`git checkout master && git checkout -b develop && git push -u origin develop`).
