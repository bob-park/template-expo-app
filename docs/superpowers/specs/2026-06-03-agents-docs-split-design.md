# AGENTS.md → docs/agents 분리 설계

> 단일 거대 `AGENTS.md` 를 토픽별 `docs/agents/` 문서로 분리하고, `AGENTS.md`
> 는 thin map 으로 재작성한다. 구조와 문서 포맷은 `template-nextjs-app` 의
> `docs/agents/` 규약을 1:1 미러링하며, React 공통 컨벤션은 동일 규칙 + RN/Expo
> 예시로 정렬한다.

## Background & Goal

현재 `template-expo-app` 의 모든 에이전트 컨벤션은 단일 `AGENTS.md`(약 600줄)
에 들어 있다. 에이전트가 특정 작업(새 도메인 추가, slice 작성, PR 올리기 등)을
할 때 전체 파일을 읽어야 관련 규칙을 찾을 수 있어 비효율적이다.

레퍼런스 프로젝트 `/Users/hwpark/Documents/webstorm-workspace/template-nextjs-app`
는 이미 `docs/agents/` 토픽 분리 구조를 사용한다. 각 문서가 frontmatter +
TL;DR blockquote 로 시작해, 에이전트가 **첫 5~10줄만 보고** 적용 여부를 판단할
수 있다.

**목표:** Expo 프로젝트도 같은 구조를 채택해, 에이전트가 작업별로 필요한
문서만 골라 읽을 수 있게 한다. React 관련 컨벤션은 두 레포가 같은 규칙을
공유하도록 정렬한다.

## Decisions (확정)

1. **구조:** nextjs `docs/agents/` 레이아웃을 1:1 미러링한다.
   (top-level `overview`/`tech-stack`/`structure` + `conventions/` + `libs/` +
   `workflows/`)
2. **React 일치도:** 섹션 주석 순서, zustand slice, naming, TypeScript 등 공통
   컨벤션은 **규칙 서술은 nextjs 와 동일**하게, **코드 예시는 React Native/Expo**
   (`View`/`Text`, NativeWind, expo-router) 로 작성한다.
3. **AGENTS / CLAUDE:** `AGENTS.md` 는 thin Map + How-to-use 인덱스로 축소.
   §9 디자인 워크플로우는 `docs/agents/workflows/design-workflow.md` 로 분리.
   `CLAUDE.md` 오버레이는 유지하되 §-번호 참조를 문서 링크로 갱신.

## Target Structure

```
docs/agents/
├── overview.md                      ← AGENTS §1
├── tech-stack.md                    ← AGENTS §2
├── structure.md                     ← AGENTS §3 (tree + placement rules + expo-router routes/(tabs))
├── conventions/
│   ├── module-aliases.md            ← §4.3 Import Order + @/*, @/assets/* aliases
│   ├── naming.md                    ← §4.2 Naming table + *.dto.ts 파일 규칙
│   ├── typescript.md                ← §4.1 strict/interface-vs-type + §4.4 DTO shape & export block
│   └── react-sections.md            ← §4.9 Screen Components + §4.11 Comments + §4.12 Section Comments
├── libs/
│   ├── zustand-slice.md             ← §4.8 Store/Slice (SlicePattern, action naming, persist+secure-store)
│   ├── ky-react-query.md            ← §4.5 API Module + §4.6 React Query Hook
│   ├── nativewind.md                ← §4.10 Styling (NativeWind / Tailwind v4 / dark:)
│   └── providers.md                 ← §4.7 Provider Pattern (Context + useMemo; Auth/I18n/Notification/Theme/RQ)
└── workflows/
    ├── dev-env.md                   ← §10 Quality Gates (yarn lint/prettier, ios/android) + Metro --clear
    ├── git.md                       ← §5 Branch + §6 Commit + §7 PR & Versioning
    ├── env-secrets.md               ← §8 Environment & Secrets
    └── design-workflow.md           ← §9 Design Prompt Workflow (6-step contract)
```

총 15개 토픽 문서 + `AGENTS.md` 재작성 + `CLAUDE.md` 링크 갱신.

## Document Format (nextjs 와 동일)

모든 토픽 문서는 frontmatter + TL;DR blockquote 로 시작한다:

```markdown
---
title: <문서 제목>
scope: <규칙이 적용되는 glob, 예: src/**/*.tsx>
applies_to: <이 문서를 읽게 되는 작업, 예: declaring a Zustand slice>
related:
  - ./other.md
---

# <제목>

> <한 줄 TL;DR — 첫 5줄만 보고 적용 여부 판단 가능하도록>

<본문>
```

본문은 영어, 도메인/비즈니스 라벨은 한국어 유지 (기존 AGENTS.md 규약 계승).

## Section → File 매핑 상세

| 기존 AGENTS.md 섹션 | 대상 문서 |
| --- | --- |
| §1 Overview | `overview.md` |
| §2 Tech Stack & Requirements | `tech-stack.md` (정확한 버전은 package.json 참조 명시) |
| §3 Directory Structure + Placement rules | `structure.md` (expo-router 파일 기반 라우팅, `(tabs)` 그룹 포함) |
| §4.1 TypeScript | `conventions/typescript.md` |
| §4.2 Naming | `conventions/naming.md` |
| §4.3 Import Order | `conventions/module-aliases.md` (+ `@/*`→`src/*`, `@/assets/*`→`assets/*`) |
| §4.4 DTO Pattern | 파일명 규칙은 `naming.md`, shape/`export type {}` 블록은 `typescript.md` |
| §4.5 API Module Pattern | `libs/ky-react-query.md` |
| §4.6 React Query Hook Pattern | `libs/ky-react-query.md` |
| §4.7 Provider Pattern | `libs/providers.md` |
| §4.8 Store / Slice Pattern | `libs/zustand-slice.md` |
| §4.9 Screen Components | `conventions/react-sections.md` |
| §4.10 Styling | `libs/nativewind.md` |
| §4.11 Comments | `conventions/react-sections.md` |
| §4.12 Section Comments | `conventions/react-sections.md` |
| §5 Branch Naming | `workflows/git.md` |
| §6 Commit Message | `workflows/git.md` |
| §7 PR & Versioning | `workflows/git.md` |
| §8 Environment & Secrets | `workflows/env-secrets.md` |
| §9 Design Prompt Workflow | `workflows/design-workflow.md` |
| §10 Quality Gates | `workflows/dev-env.md` |

## React 컨벤션 정렬 (Decision 2)

다음 4개 문서는 nextjs 문서의 **규칙 서술을 그대로 정렬**하되 예시만 RN/Expo 로
바꾼다:

- `conventions/react-sections.md` — 동일한 11-섹션 고정 순서. 예시는 `View`/`Text`,
  `nativewind` 의 `useColorScheme`, expo-router hook 사용. nextjs 의 Server/Client
  분리 섹션은 제외(Expo 는 RSC 없음).
- `libs/zustand-slice.md` — 동일한 `SlicePattern<T, BoundState>`, `domain/action`
  devtools 이름, immer. Expo 의 persist→AsyncStorage + secure-store(토큰 비-persist)
  규칙을 추가.
- `conventions/naming.md` / `conventions/typescript.md` — 동일 컨벤션,
  `Readonly<{...}>` props, 파일 하단 `export type {}` 블록.

## AGENTS.md (재작성)

nextjs `AGENTS.md` 와 동일한 구조:

1. 한 줄 목적 + 본문 영어/도메인 한국어 안내.
2. frontmatter+TL;DR 규약 안내 (첫 5~10줄만 보면 됨).
3. **Map** — Foundations / Conventions / Library Patterns / Workflows 카테고리별
   문서 링크 + 한 줄 설명.
4. **How to use** — 작업 지향 진입점 (예: "새 도메인 추가 → structure.md →
   ky-react-query.md → zustand-slice.md", "PR 올리기 → workflows/git.md").
5. **Precedence** 블록 유지 (User > CLAUDE.md > AGENTS.md, README 와의 관계).

## CLAUDE.md (갱신)

- `@AGENTS.md` import 유지.
- Claude 전용 규칙(Plan Mode, Superpowers, Subagent, Visual Companion, 금지사항)
  유지.
- "AGENTS.md §9 디자인 워크플로우" 참조 → `docs/agents/workflows/design-workflow.md`
  링크로 변경.

## YAGNI (생성하지 않음)

- i18n(i18next) / dayjs / push-notification 내부 패턴 문서 — 기존 AGENTS.md 가
  tech-stack 나열만 하고 패턴을 정의하지 않으므로 `tech-stack.md` 항목으로만 유지.
- nextjs 전용 문서(next-intl, overlay-kit, theme server-action, build-release/Docker)
  — Expo 등가물 없음.

## Quality Gates (완료 기준)

- 15개 문서 + `AGENTS.md` + `CLAUDE.md` 작성/갱신 완료.
- 기존 `AGENTS.md` 의 모든 규범적 내용이 문서 어딘가에 보존됨 (위 매핑 표로 검증).
- 모든 토픽 문서가 frontmatter(`title`/`scope`/`applies_to`/`related`) + TL;DR
  blockquote 로 시작.
- 문서 간 `related` / 본문 링크가 실제 경로를 가리킴 (broken link 없음).
- `yarn prettier` 가 markdown 에 diff 를 만들지 않음.
```
