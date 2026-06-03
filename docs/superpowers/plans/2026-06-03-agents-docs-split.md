# AGENTS.md → docs/agents 분리 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 단일 `AGENTS.md` 를 토픽별 `docs/agents/` 문서 15개로 분리하고, `AGENTS.md` 를 thin map 으로 재작성한다.

**Architecture:** `template-nextjs-app/docs/agents/` 구조를 1:1 미러링. 각 문서는 frontmatter(`title`/`scope`/`applies_to`/`related`) + TL;DR blockquote 로 시작한다. 본문 내용은 기존 `AGENTS.md` 섹션에서 포팅하고, React 공통 컨벤션 4종은 nextjs 문서의 규칙 서술을 정렬하되 코드 예시만 React Native/Expo 로 바꾼다.

**Tech Stack:** Markdown 문서. 검증은 `grep`(frontmatter/TL;DR), 링크 존재 확인, `yarn prettier`.

---

## 참조 소스 (실행 전 필독)

작업 전 아래 3개를 열어둔다. 모든 본문 내용은 여기서 포팅한다:

- **포팅 원본:** `AGENTS.md` (template-expo-app, repo root) — 모든 규범 내용의 출처.
- **미러 레퍼런스(구조/포맷):** `/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app/docs/agents/` — frontmatter/TL;DR 스타일, 카테고리 구성.
- **확정 설계:** `docs/superpowers/specs/2026-06-03-agents-docs-split-design.md` — 섹션→파일 매핑 표.

**포맷 규칙 (모든 토픽 문서 공통):**

1. frontmatter 4필드: `title`, `scope`(적용 glob), `applies_to`(읽게 되는 작업), `related`(상대경로 링크 리스트).
2. frontmatter 직후 `# 제목`, 그 다음 `> TL;DR` blockquote 한 줄.
3. 본문 영어, 도메인/비즈니스 라벨·한국어 UI 텍스트는 한국어 유지.
4. cross-folder 링크는 상대경로 (`../structure.md`, `./naming.md`).

**`AGENTS.md` 본문은 이 plan 동안 건드리지 않는다** — Task 6 에서 한 번에 교체한다. 그 전까지 원본이 source-of-truth 로 남아 있어야 한다.

---

## File Structure

```
docs/agents/
├── overview.md          (Task 1)
├── tech-stack.md        (Task 1)
├── structure.md         (Task 2)
├── conventions/
│   ├── module-aliases.md  (Task 3)
│   ├── naming.md          (Task 3)
│   ├── typescript.md      (Task 3)
│   └── react-sections.md  (Task 3)
├── libs/
│   ├── zustand-slice.md   (Task 4)
│   ├── ky-react-query.md  (Task 4)
│   ├── nativewind.md      (Task 4)
│   └── providers.md       (Task 4)
└── workflows/
    ├── dev-env.md         (Task 5)
    ├── git.md             (Task 5)
    ├── env-secrets.md     (Task 5)
    └── design-workflow.md (Task 5)
AGENTS.md                (Task 6 — 재작성)
CLAUDE.md                (Task 7 — 링크 갱신)
```

브랜치는 이미 `feature/agents-docs-split` 에 있다 (spec 커밋 위치). 계속 이 브랜치에서 작업한다.

---

### Task 1: Foundations — overview.md + tech-stack.md

**Files:**
- Create: `docs/agents/overview.md`
- Create: `docs/agents/tech-stack.md`

- [ ] **Step 1: Create `docs/agents/overview.md`**

Frontmatter + TL;DR + 본문(=`AGENTS.md` §1 Overview 를 영어 산문으로):

```markdown
---
title: Project Overview
scope: docs/**
applies_to: all agents reading this repository
related:
  - ./tech-stack.md
  - ./structure.md
---

# Project Overview

> `template-expo-app` is an Expo (React Native) starter with OAuth2 auth, push notifications, dark mode, i18n, and an animated splash.

이 레포는 새 제품 앱이 일관된 스택에서 시작할 수 있도록 미리 구성된 baseline 을 제공한다. `docs/agents/` 의 토픽 문서들이 coding convention, 디렉토리 레이아웃, branch/commit/PR 규칙, 환경 기대값, 디자인 워크플로우, quality gate 를 정의한다.
```

- [ ] **Step 2: Create `docs/agents/tech-stack.md`**

`AGENTS.md` §2 의 스택 목록을 그대로 옮긴다. 정확한 버전은 package.json 참조 명시:

```markdown
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
```

- [ ] **Step 3: Verify both files have frontmatter + TL;DR**

Run: `head -12 docs/agents/overview.md docs/agents/tech-stack.md`
Expected: 각 파일이 `---` frontmatter 로 시작하고 `> ` TL;DR 줄 포함.

- [ ] **Step 4: Commit**

```bash
git add docs/agents/overview.md docs/agents/tech-stack.md
git commit -m "docs: agents overview/tech-stack 문서 분리"
```

---

### Task 2: structure.md

**Files:**
- Create: `docs/agents/structure.md`

- [ ] **Step 1: Create `docs/agents/structure.md`**

`AGENTS.md` §3 디렉토리 트리 + placement rules 전체를 옮기고, expo-router 라우팅 설명을 짧게 보강한다. 트리는 §3 의 `src/` 트리를 그대로 사용.

```markdown
---
title: Directory Structure & Placement Rules
scope: src/**
applies_to: adding a new domain, placing screens/components, route groups
related:
  - ./conventions/naming.md
  - ./conventions/module-aliases.md
  - ./libs/zustand-slice.md
---

# Directory Structure & Placement Rules

> `src/` 는 `app/`(expo-router 라우트), `domain/<name>/{apis,queries,store}`, `shared/`, `utils/` 로 나뉜다. 라우트/스크린은 `src/app/` 에만, 도메인 전역 상태는 `src/domain/<name>/store/`, cross-domain 코드는 `src/shared/`, 프레임워크 의존 없는 순수 헬퍼는 `src/utils/`.
```

이어서 `AGENTS.md` §3 의 `src/` 코드블록 트리 전체와 "Placement rules" 불릿을 그대로 포팅한다. 마지막에 expo-router 보강 단락 추가:

```markdown
## Routing (expo-router)

- `src/app/` 의 파일 트리가 곧 라우트다 (file-based). 파일은 screen 컴포넌트만 둔다.
- `_layout.tsx` = 해당 segment 의 레이아웃(루트는 Providers + route guard).
- `(tabs)` 처럼 괄호로 감싼 폴더는 route group 으로 URL 에 segment 를 추가하지 않고 그룹의 레이아웃/탭만 묶는다.
- `+not-found.tsx` 는 404, `callback.tsx` 는 OAuth 콜백 핸들러.
```

- [ ] **Step 2: Verify**

Run: `head -12 docs/agents/structure.md && grep -c '├──' docs/agents/structure.md`
Expected: frontmatter+TL;DR 존재, 트리 라인(`├──`) 1개 이상.

- [ ] **Step 3: Commit**

```bash
git add docs/agents/structure.md
git commit -m "docs: agents structure 문서 분리"
```

---

### Task 3: conventions/ (4 files)

**Files:**
- Create: `docs/agents/conventions/module-aliases.md`
- Create: `docs/agents/conventions/naming.md`
- Create: `docs/agents/conventions/typescript.md`
- Create: `docs/agents/conventions/react-sections.md`

- [ ] **Step 1: Create `conventions/module-aliases.md`** (`AGENTS.md` §4.3 Import Order + 경로 alias)

```markdown
---
title: Module & Path Aliases / Import Order
scope: src/**/*.{ts,tsx}
applies_to: import statements across folders
related:
  - ./naming.md
  - ../structure.md
---

# Module & Path Aliases / Import Order

> Cross-folder import 는 `@/*`(→`src/*`), `@/assets/*`(→`assets/*`) alias. import 는 5그룹으로 빈 줄 구분: React → react-native/expo → 3rd-party → `@/` 내부 → side-effect.

## Path aliases

- `@/*` → `src/*`, `@/assets/*` → `assets/*`.
- 같은 폴더 내 import 는 상대경로.

## Import order
```

이어서 `AGENTS.md` §4.3 의 5그룹 순서 리스트 + `AuthProvider.tsx` import 예시 코드블록을 그대로 포팅한다.

- [ ] **Step 2: Create `conventions/naming.md`** (`AGENTS.md` §4.2 Naming 표 + §4.4 의 DTO 파일명 규칙)

```markdown
---
title: File & Identifier Naming
scope: src/**
applies_to: creating any new file, naming identifiers
related:
  - ./typescript.md
  - ./react-sections.md
  - ../structure.md
---

# File & Identifier Naming

> 모듈 파일 camelCase, 컴포넌트 PascalCase, DTO `<name>.dto.ts`, hook `useXxx`, 함수 camelCase 동사-우선, 상수 UPPER_SNAKE_CASE, route group `(group)`. 도메인/비즈니스 라벨은 한국어.
```

이어서 `AGENTS.md` §4.2 의 naming 표 전체 + 한국어 라벨 규칙 + `THEME_OPTIONS` 예시를 포팅. 그리고 §4.4 에서 **파일명 규칙만** 발췌:

```markdown
## DTO 파일

- 도메인당 한 파일: `<domain>.dto.ts` (예: `users.dto.ts`).
- shape/타입 정의 규칙은 [TypeScript](./typescript.md) 참조.
```

- [ ] **Step 3: Create `conventions/typescript.md`** (`AGENTS.md` §4.1 + §4.4 의 shape/export 규칙)

```markdown
---
title: TypeScript
scope: src/**/*.{ts,tsx}
applies_to: type declarations, component props, DTOs
related:
  - ./naming.md
  - ../libs/ky-react-query.md
---

# TypeScript

> `strict: true` 고정. 객체 shape 는 `interface`, union/alias 는 `type`. 컴포넌트 props 는 `Readonly<{...}>`. 타입은 파일 하단 `export type { ... }` 블록으로 re-export.

- `strict: true` is mandatory; `tsconfig.json` 을 약화시키지 않는다.
- 객체 shape 는 `interface`, union/alias 는 `type`.
- 컴포넌트 props 는 `Readonly<{...}>` 로 감싼다.
- 타입은 파일 하단에서 `export type { ... }` 로 re-export 한다.
```

이어서 `AGENTS.md` §4.1 의 `UserDetail`/`UserRoleDetail` export 예시와 §4.4 의 `users.dto.ts` 예시 코드블록을 포팅한다 (DTO shape + bottom export 블록 보여주는 용도).

- [ ] **Step 4: Create `conventions/react-sections.md`** (`AGENTS.md` §4.9 + §4.11 + §4.12)

nextjs `conventions/react-sections.md` 의 **규칙 서술을 정렬**하되, 예시는 RN/Expo 로. 11-섹션 순서는 `AGENTS.md` §4.12 와 동일.

```markdown
---
title: React Components, Comments & Section Comments
scope: src/**/*.tsx
applies_to: screen components, custom hooks (useXxx.tsx), shared providers
related:
  - ./naming.md
  - ../libs/zustand-slice.md
  - ../libs/nativewind.md
---

# React Components, Comments & Section Comments

> 컴포넌트/커스텀 hook/shared provider 함수 본문은 11개 고정 순서 섹션 주석으로 구분한다. 사용 안 하는 섹션은 생략(빈 헤더 금지). 기본은 주석 없음 — 식별자 이름이 의미를 담는다. 도메인 라벨은 한국어.
```

본문 구성:
1. **Comments 정책** — `AGENTS.md` §4.11 (기본 none, 허용: 섹션 마커 + 비즈니스 한 줄 한국어 주석, WHAT narration 금지).
2. **Section comment 순서** — §4.12 의 11개 순서 리스트(`// ref` → `// callback`) 그대로 포팅. nextjs 의 Server/Client 분리 섹션은 넣지 않는다(Expo 는 RSC 없음).
3. **표준 예시** — §4.12 의 `Contents()` 예시(이미 RN `View`/`useColorScheme` 기반)를 그대로 포팅.
4. **Screen components** — §4.9 의 규칙(route file 당 default export, NativeWind `className`, `classnames` 조건부, 한국어 라벨) + `TouchableOpacity` 예시 포팅.
5. **Migration policy** — §4.12 마지막 문단(기존 파일 일괄 마이그레이션 금지, 수정 시 같은 PR 에서 점진 정리).

- [ ] **Step 5: Verify all 4 conventions files**

Run: `for f in docs/agents/conventions/*.md; do echo "== $f =="; head -8 "$f"; done`
Expected: 4개 파일 모두 frontmatter + `# 제목` + `> TL;DR`.

- [ ] **Step 6: Commit**

```bash
git add docs/agents/conventions
git commit -m "docs: agents conventions(naming/typescript/react-sections/module-aliases) 분리"
```

---

### Task 4: libs/ (4 files)

**Files:**
- Create: `docs/agents/libs/ky-react-query.md`
- Create: `docs/agents/libs/zustand-slice.md`
- Create: `docs/agents/libs/nativewind.md`
- Create: `docs/agents/libs/providers.md`

- [ ] **Step 1: Create `libs/ky-react-query.md`** (`AGENTS.md` §4.5 API Module + §4.6 React Query Hook)

```markdown
---
title: ky + React Query
scope: src/domain/*/apis/**, src/domain/*/queries/**, src/shared/api/**
applies_to: HTTP requests, query/mutation hooks
related:
  - ../structure.md
  - ../conventions/typescript.md
  - ../conventions/naming.md
---

# ky + React Query

> API 모듈은 공유 `api`(ky) + `generateAuthHeader(accessToken)`, 엔드포인트당 `async` 함수 하나, `.json<DTO>()` 반환. Query hook 은 `use<Action><Noun>`, query key `[resource, id, subresource, action?]`, mutation 은 `QueryMutationHandle<T>` 받고 action-named 키 반환.
```

본문: §4.5 의 API 모듈 규칙 불릿 + `users.ts` 예시 코드블록, 그리고 §4.6 의 React Query hook 규칙 불릿 + `userNotification.tsx` 예시 코드블록을 그대로 포팅한다.

- [ ] **Step 2: Create `libs/zustand-slice.md`** (`AGENTS.md` §4.8 전체)

nextjs `libs/zustand-slice.md` 와 동일 규칙(SlicePattern, `domain/action`, immer)을 정렬하되, Expo 의 persist→AsyncStorage + secure-store 규칙을 포함한다 (이미 §4.8 에 있음).

```markdown
---
title: Zustand Slice Pattern
scope: src/domain/*/store/**, src/shared/store/**
applies_to: declaring or modifying a Zustand slice / store action
related:
  - ../structure.md
  - ../conventions/react-sections.md
---

# Zustand Slice Pattern

> 도메인 전역 상태는 `SlicePattern<TSlice, BoundState>` slice 로 만들고 `rootStore.ts` 에서 spread 합성. 모든 `set` 은 devtools action 명시(`set(updater, false, { type: 'domain/action' })`). 셀렉터는 속성 단위만(객체 분해 금지). persist 는 비-민감 정보만, 토큰은 expo-secure-store.
```

본문: §4.8 의 file layout 불릿, 규칙 불릿(셀렉터 OK/금지 예시 포함), When-to-use 표, Persist 규칙, state/slice/rootStore/소비자 예시 코드블록 전체를 그대로 포팅한다.

- [ ] **Step 3: Create `libs/nativewind.md`** (`AGENTS.md` §4.10 Styling)

```markdown
---
title: NativeWind / Styling
scope: src/**/*.tsx
applies_to: styling components, dark mode
related:
  - ../conventions/react-sections.md
---

# NativeWind / Styling

> NativeWind utility class(`className`) 우선, `StyleSheet.create` 는 표현 불가할 때만. dark mode 는 `dark:` prefix(ThemeProvider 가 scheme 토글). 색/토큰은 Tailwind config 에서, JSX 에 hex 하드코딩 금지(프로토타이핑 제외).
```

본문: §4.10 의 styling 규칙 불릿을 포팅. (조건부 class 예시는 react-sections 의 `TouchableOpacity` 예시를 링크로 참조하거나 짧게 재현.)

- [ ] **Step 4: Create `libs/providers.md`** (`AGENTS.md` §4.7 Provider Pattern)

```markdown
---
title: Context Provider Pattern
scope: src/shared/providers/**
applies_to: creating or modifying a Context provider
related:
  - ../conventions/react-sections.md
  - ./zustand-slice.md
---

# Context Provider Pattern

> Provider 컴포넌트는 `default export`, `Context` 와 public 타입은 named export. 함수 본문은 [section comment](../conventions/react-sections.md) 순서를 따르고 context value 는 `useMemo` 로 감싼다. 앱의 provider: Auth, I18n, Notification, Theme, RQ (`src/shared/providers/`).
```

본문: §4.7 의 규칙 불릿 + `FooProvider` skeleton 코드블록을 그대로 포팅. zustand 와의 역할 구분(transient 의존성 주입은 Context, 공유 클라이언트 상태는 store)은 [zustand-slice](./zustand-slice.md) 링크로 연결.

- [ ] **Step 5: Verify all 4 libs files**

Run: `for f in docs/agents/libs/*.md; do echo "== $f =="; head -8 "$f"; done`
Expected: 4개 모두 frontmatter + TL;DR.

- [ ] **Step 6: Commit**

```bash
git add docs/agents/libs
git commit -m "docs: agents libs(ky-react-query/zustand-slice/nativewind/providers) 분리"
```

---

### Task 5: workflows/ (4 files)

**Files:**
- Create: `docs/agents/workflows/git.md`
- Create: `docs/agents/workflows/dev-env.md`
- Create: `docs/agents/workflows/env-secrets.md`
- Create: `docs/agents/workflows/design-workflow.md`

- [ ] **Step 1: Create `workflows/git.md`** (`AGENTS.md` §5 Branch + §6 Commit + §7 PR)

```markdown
---
title: Git Workflow (Branch / Commit / PR)
scope: .git/**
applies_to: branching, commits, opening PRs, version bumps
related:
  - ./dev-env.md
---

# Git Workflow (Branch / Commit / PR)

> `master`/`develop`/`feature/*`/`hotfix/*` 4-branch. feature PR base 는 반드시 `develop`(master 직접 금지). 커밋 prefix = `feat/refactor/fix/build/docs/test`. PR 제목의 `[major]`/`[minor]` 토큰이 version bump 결정.
```

본문: §5 Branch Naming(규칙+Rules), §6 Commit Message(prefix 표 + 예시), §7 PR & Versioning 을 그대로 포팅한다.

- [ ] **Step 2: Create `workflows/dev-env.md`** (`AGENTS.md` §10 Quality Gates + Metro 재시작 노트)

```markdown
---
title: Dev Environment & Quality Gates
scope: package.json
applies_to: running scripts, pre-commit lint/format, verifying UI changes
related:
  - ../tech-stack.md
  - ./git.md
---

# Dev Environment & Quality Gates

> 코드 변경 완료 전: `yarn lint` 통과, `yarn prettier` diff 없음. UI 변경은 가능하면 `yarn ios`/`yarn android` 로 시뮬레이터 확인. `.env` 변경 후 `yarn start --clear` 로 Metro 재시작.
```

본문: §10 의 quality gate 불릿 전체 + §8 의 "After changing `.env`, restart Metro with `yarn start --clear`" 한 줄을 포함한다.

- [ ] **Step 3: Create `workflows/env-secrets.md`** (`AGENTS.md` §8 Environment & Secrets)

```markdown
---
title: Environment & Secrets
scope: .env, app.config.ts, google-services.json, GoogleService-Info.plist
applies_to: env vars, secret handling, native config files
related:
  - ./dev-env.md
---

# Environment & Secrets

> `EXPO_PUBLIC_API_HOST` 만 클라이언트 번들 노출. `AUTHORIZATION_*` 는 `app.config.ts → extra.auth` 경유. native config(`google-services.json`, `GoogleService-Info.plist`)는 repo root 필요. secret-bearing 파일은 절대 커밋 금지.
```

본문: §8 의 불릿 전체(`.env` 키 설명, native config, never-commit, Metro 재시작)를 포팅한다. (Metro 재시작은 dev-env 와 중복 노출되어도 무방 — 여기선 secret 변경 맥락.)

- [ ] **Step 4: Create `workflows/design-workflow.md`** (`AGENTS.md` §9 Design Prompt Workflow)

```markdown
---
title: Design Prompt Workflow
scope: docs/design/**, src/**
applies_to: UI/디자인 작업(목업, 레이아웃 비교, 비주얼 컴포넌트)
related:
  - ../../../CLAUDE.md
---

# Design Prompt Workflow

> 템플릿은 `./docs/design/`. UI 요청 시 6단계: 템플릿 확인 → (동의 시)임시 디렉토리에 HTML 목업 → 로컬 HTTP 서버 → 피드백 반복 → 최종 합의분만 `src/` 반영 → 서버 정리. agent-agnostic 계약.
```

본문: §9 의 6단계 워크플로우 전체와 마지막 "agent-agnostic / Claude Visual Companion" 단락을 포팅한다.

- [ ] **Step 5: Verify all 4 workflows files**

Run: `for f in docs/agents/workflows/*.md; do echo "== $f =="; head -8 "$f"; done`
Expected: 4개 모두 frontmatter + TL;DR.

- [ ] **Step 6: Commit**

```bash
git add docs/agents/workflows
git commit -m "docs: agents workflows(git/dev-env/env-secrets/design-workflow) 분리"
```

---

### Task 6: AGENTS.md 를 thin map 으로 재작성

**Files:**
- Modify: `AGENTS.md` (전체 교체)

- [ ] **Step 1: `AGENTS.md` 전체를 thin map 으로 교체**

nextjs `AGENTS.md` 구조를 따른다. Precedence 블록(기존 §Precedence)은 보존한다. 전체 내용:

````markdown
# AGENTS.md

> Cross-agent convention 문서. 모든 code agent(Claude Code, Cursor, Aider, Codex, Copilot 등)에 적용된다. 본문 영어, 도메인/비즈니스 라벨은 한국어.

세부 규칙은 `docs/agents/` 아래 토픽별 문서를 참조한다. 각 문서는 frontmatter(`title`, `scope`, `applies_to`, `related`) 와 TL;DR blockquote 로 시작하므로, 작업 전 첫 5~10줄만 확인하면 적용 여부를 판단할 수 있다.

## Precedence

User instructions > `CLAUDE.md` (Claude Code overlay) > `AGENTS.md`.
이 문서와 `README.md` 가 충돌하면 agent 행동에 대해서는 이 문서가 우선한다; `README.md` 는 사람 대상 onboarding 문서로 유지된다.

## Map

### Foundations
- [Project Overview](docs/agents/overview.md) — 앱 목적과 경계
- [Tech Stack & Requirements](docs/agents/tech-stack.md) — 스택/핀 버전 위치
- [Directory Structure & Placement Rules](docs/agents/structure.md) — `src/` 트리, 도메인 추가, expo-router 라우팅

### Conventions (`src/**/*.{ts,tsx}`)
- [Module & Path Aliases / Import Order](docs/agents/conventions/module-aliases.md)
- [File & Identifier Naming](docs/agents/conventions/naming.md)
- [TypeScript](docs/agents/conventions/typescript.md)
- [React Components, Comments & Section Comments](docs/agents/conventions/react-sections.md)

### Library Patterns
- [ky + React Query](docs/agents/libs/ky-react-query.md) — 공유 `api`, query key, mutation hook
- [Zustand Slice](docs/agents/libs/zustand-slice.md) — `SlicePattern`, action naming, persist/secure-store
- [NativeWind / Styling](docs/agents/libs/nativewind.md) — utility class, `dark:` 다크모드
- [Context Provider Pattern](docs/agents/libs/providers.md) — Provider/Context, `useMemo` value

### Workflows
- [Git Workflow](docs/agents/workflows/git.md) — branch, commit prefix, PR base, version bump
- [Dev Environment & Quality Gates](docs/agents/workflows/dev-env.md) — lint/prettier, 시뮬레이터 확인
- [Environment & Secrets](docs/agents/workflows/env-secrets.md) — `.env`, native config, secret 금지
- [Design Prompt Workflow](docs/agents/workflows/design-workflow.md) — 6단계 목업 워크플로우

## How to use

- 새 도메인 추가 → `structure.md` → `libs/ky-react-query.md` → `libs/zustand-slice.md`
- 새 화면/스크린 → `structure.md`(routing) → `conventions/react-sections.md`
- API + query hook 작성 → `libs/ky-react-query.md`
- 전역 상태 추가 → `libs/zustand-slice.md`
- Context provider 작성 → `libs/providers.md`
- 스타일링/다크모드 → `libs/nativewind.md`
- UI/디자인 목업 → `workflows/design-workflow.md`
- PR 올리기 → `workflows/git.md`
- 커밋 전 점검 → `workflows/dev-env.md`
````

- [ ] **Step 2: Verify 기존 규범 내용이 전부 문서로 이동했는지 확인**

Run: `grep -rl "SlicePattern\|generateAuthHeader\|section comment\|EXPO_PUBLIC_API_HOST" docs/agents`
Expected: 핵심 키워드가 각각 적절한 docs/agents 파일에 존재(zustand-slice, ky-react-query, react-sections, env-secrets).

- [ ] **Step 3: Commit**

```bash
git add AGENTS.md
git commit -m "docs: AGENTS.md 를 thin map 으로 재작성"
```

---

### Task 7: CLAUDE.md 링크 갱신

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: 디자인 워크플로우 참조를 문서 링크로 변경**

`CLAUDE.md` 의 `### Visual Companion` 섹션에서 "AGENTS.md §9 디자인 워크플로우" 문구와 "AGENTS.md 의 6 단계 워크플로우" 문구를 `docs/agents/workflows/design-workflow.md` 링크로 바꾼다. 예:

- `- AGENTS.md §9 디자인 워크플로우를 Claude Code 에서 실행할 때,` →
  `- [디자인 워크플로우](docs/agents/workflows/design-workflow.md) 를 Claude Code 에서 실행할 때,`
- `- AGENTS.md 의 6 단계 워크플로우(...)가 항상 우선한다.` →
  `- design-workflow.md 의 6 단계 워크플로우(...)가 항상 우선한다.`

나머지 Claude 전용 규칙(Plan Mode, Superpowers, Subagent, 금지사항)과 `@AGENTS.md` import 는 그대로 둔다.

- [ ] **Step 2: Verify**

Run: `grep -n "design-workflow\|§9" CLAUDE.md`
Expected: `design-workflow.md` 링크 존재, `§9` 잔존 참조 없음.

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.md 디자인 워크플로우 참조를 docs/agents 링크로 갱신"
```

---

### Task 8: 최종 검증 (링크 + prettier + 커버리지)

**Files:** 없음 (검증 + 필요 시 수정).

- [ ] **Step 1: 전체 문서 frontmatter/TL;DR 일괄 점검**

Run: `for f in $(find docs/agents -name '*.md'); do head -1 "$f" | grep -q '^---$' && echo "OK  $f" || echo "BAD $f"; done`
Expected: 15줄 모두 `OK`.

- [ ] **Step 2: broken link 점검**

Run:
```bash
cd docs/agents && for f in $(find . -name '*.md'); do \
  grep -oE '\]\((\.[^)]+\.md)' "$f" | sed -E 's/\]\(//' | while read link; do \
    target=$(cd "$(dirname "$f")" && python3 -c "import os,sys; print(os.path.normpath(sys.argv[1]))" "$link"); \
    [ -f "$(dirname "$f")/$link" ] || echo "BROKEN in $f -> $link"; \
  done; done; cd ../..
```
Expected: 출력 없음(broken link 0).
간단 대안: `grep -rhoE '\]\(\.[^)]+\)' docs/agents` 로 링크를 눈으로 확인하고 대상 파일 존재를 점검.

- [ ] **Step 3: prettier 점검**

Run: `yarn prettier 2>&1 | tail -5`
Expected: markdown 파일에 변경 없음(또는 prettier 가 포맷 정리 후 clean). diff 가 생기면 commit 에 포함.

- [ ] **Step 4: 커버리지 — 기존 AGENTS.md 섹션 누락 점검**

설계 문서의 매핑 표(`docs/superpowers/specs/2026-06-03-agents-docs-split-design.md`)의 각 행을 훑어, §1~§10 / §4.1~§4.12 의 모든 규범 내용이 어느 문서엔가 존재하는지 확인한다. 누락 발견 시 해당 토픽 문서에 추가.

- [ ] **Step 5: prettier diff 있으면 commit**

```bash
git add -A && git commit -m "docs: agents 문서 prettier 포맷 정리" || echo "no changes"
```

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** spec 의 섹션→파일 매핑 표 18행이 Task 1~5 에 모두 배정됨. AGENTS thin map = Task 6, CLAUDE = Task 7, 검증 = Task 8. 누락 없음.
- **Placeholder scan:** 모든 토픽 문서에 대해 frontmatter 는 verbatim 제공, 본문은 "`AGENTS.md` §X 를 포팅" + 보강 지점 명시. 실행자가 채울 본문 출처가 항상 특정 섹션을 가리킴(막연한 TODO 없음).
- **Type/naming consistency:** 파일 경로·frontmatter `title`·AGENTS map 링크 텍스트가 Task 간 일치(예: `module-aliases.md` 의 title "Module & Path Aliases / Import Order" 가 map 링크와 동일). DTO 규칙은 naming(파일명)+typescript(shape)로 분할되며 양쪽이 서로 링크.
