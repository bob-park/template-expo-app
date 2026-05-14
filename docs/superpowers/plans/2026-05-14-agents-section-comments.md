# AGENTS.md §4.11 Section Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a canonical 9-section ordering rule for React function bodies to `AGENTS.md` (§4.11), point §4.7 / §4.8 / §4.10 at it, and ship it through a PR.

**Architecture:** Documentation-only change to a single file (`AGENTS.md`). One new subsection (§4.11) plus three small cross-reference touch-ups. No code under `src/` is modified — migration is opportunistic per §4.11's own policy.

**Tech Stack:** Markdown, prettier (Markdown formatter), `yarn lint`. Verification is `yarn prettier --check AGENTS.md` plus a manual read against the spec's acceptance criteria.

**Spec reference:** `docs/superpowers/specs/2026-05-14-agents-section-comments-design.md`

---

## File Structure

| Path | Action | Responsibility |
|------|--------|----------------|
| `AGENTS.md` | Modify | Adds §4.11 (canonical rule). Updates §4.7 bullet + skeleton, §4.8 (pointer bullet), §4.10 (cross-reference target). |

No new files. No code files touched.

---

## Pre-flight: Branch setup

### Task 0: Create feature branch

**Why:** AGENTS.md §5 forbids direct push to `master`. Work needs to land via PR from `feature/<slug>`.

- [ ] **Step 1: Confirm clean working tree**

Run: `git -C /Users/hwpark/Documents/rn-workspace/template-expo-app status --short`
Expected: empty output (the spec commit `a4c3df0` is already on `master`).

- [ ] **Step 2: Create and switch to feature branch**

```bash
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app checkout -b feature/agents-section-comments
```
Expected: `Switched to a new branch 'feature/agents-section-comments'`

- [ ] **Step 3: Confirm the spec commit is on this branch**

Run: `git -C /Users/hwpark/Documents/rn-workspace/template-expo-app log --oneline -3`
Expected: `a4c3df0 docs: add AGENTS.md §4.11 section-comments design spec` is in the list.

---

## Task 1: Add §4.11 (the canonical rule)

**Files:**
- Modify: `AGENTS.md` (insert new subsection between line 285 and line 287, i.e. after §4.10 and before §5)

This is the single biggest edit. After it, §4.11 exists but is not yet referenced from §4.7 / §4.8 / §4.10 — that's fixed in Task 2.

- [ ] **Step 1: Insert §4.11**

Find the exact anchor in `AGENTS.md`:

```markdown
### 4.10 Comments

- Default: write none. Identifier names should carry the meaning.
- Permitted: section markers inside Providers (see §4.7), and one-line
  Korean comments for non-obvious 비지니스 reasoning.
- Never narrate WHAT the code does.

## 5. Branch Naming Convention
```

Replace with (note: §4.10 body stays unchanged for now — it gets edited in Task 2):

````markdown
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
````

Notes for the editor:
- Use the Edit tool with the literal `### 4.10 Comments ... ## 5. Branch Naming Convention` block above as `old_string` so the location is uniquely identified.
- The fenced example uses ` ``` ` inside, so the outer fence in the markdown must be ` ```` ` (4 backticks). This matches the spec doc style.
- Internal import order in the example follows §4.3: react → react-native → third-party → `@/` imports.

- [ ] **Step 2: Verify the insertion**

Run: `grep -n "^### 4\." /Users/hwpark/Documents/rn-workspace/template-expo-app/AGENTS.md`
Expected: lines for 4.1 through 4.11 are listed in order.

Run: `grep -c "^// ref$" /Users/hwpark/Documents/rn-workspace/template-expo-app/AGENTS.md` — N/A, the `// ref` token is inside a code fence so grep behaviour is fine; instead:
Run: `grep -n "### 4.11 Section Comments" /Users/hwpark/Documents/rn-workspace/template-expo-app/AGENTS.md`
Expected: exactly one match.

- [ ] **Step 3: Prettier-check the file**

Run: `cd /Users/hwpark/Documents/rn-workspace/template-expo-app && yarn prettier --check AGENTS.md`
Expected: `Checking formatting...` followed by `All matched files use Prettier code style!`. If it reports formatting issues, run `yarn prettier --write AGENTS.md` and inspect the diff with `git diff AGENTS.md` to make sure only whitespace/wrapping changed.

- [ ] **Step 4: Commit**

```bash
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app add AGENTS.md
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app commit -m "$(cat <<'EOF'
docs: AGENTS.md §4.11 section comments 추가

9-section 고정 순서(ref → context → state → queries → useEffect
→ useLayoutEffect → handle → memorize → callback)를 canonical
규칙으로 도입. RN 어댑테이션, opportunistic 마이그레이션 정책 포함.

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```
Expected: commit succeeds, status shows clean tree.

---

## Task 2: Update §4.7 / §4.8 / §4.10 cross-references

**Files:**
- Modify: `AGENTS.md`
  - §4.7 (lines around 216–252 in the original file): replace the section-comments bullet, reorder the skeleton example
  - §4.8 (lines around 254–270): append a new bullet
  - §4.10 (lines around 280–285): update cross-reference target from §4.7 to §4.11

Note: line numbers shift after Task 1. Use the textual anchors below, not line numbers.

- [ ] **Step 1: Update the §4.7 section-comments bullet**

Find in `AGENTS.md`:

```markdown
- Group blocks inside the component with **Korean section comments**:
  `// state`, `// context`, `// hooks`, `// queries`, `// useEffect`,
  `// handle`, `// memorize`.
- Wrap the context value with `useMemo`.
```

Replace with:

```markdown
- Group blocks inside the component with **section comments** per §4.11.
- Wrap the context value with `useMemo`.
```

- [ ] **Step 2: Reorder the §4.7 skeleton example**

Find in `AGENTS.md`:

```markdown
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

Replace with (§4.11 order, empty headers removed):

```markdown
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

Rationale: the original skeleton only meaningfully uses `// state`, `// useEffect`, `// handle`, `// memorize`. Empty headers (`// context`, `// hooks`, `// queries`) are removed per §4.11's "사용하지 않는 섹션은 주석을 생략한다" rule.

- [ ] **Step 3: Append the §4.8 pointer**

Find in `AGENTS.md`:

```markdown
### 4.8 Screen Components — `src/app/**`

- `default export` per route file (expo-router requirement).
- Use NativeWind `className` for styling.
- Conditional classes via `classnames` (`import cx from 'classnames'`).
- Korean text for user-visible 한국어 라벨; English for code identifiers.
```

Replace with:

```markdown
### 4.8 Screen Components — `src/app/**`

- `default export` per route file (expo-router requirement).
- Use NativeWind `className` for styling.
- Conditional classes via `classnames` (`import cx from 'classnames'`).
- Korean text for user-visible 한국어 라벨; English for code identifiers.
- Section comments follow §4.11.
```

- [ ] **Step 4: Fix §4.10 cross-reference**

Find in `AGENTS.md`:

```markdown
- Permitted: section markers inside Providers (see §4.7), and one-line
  Korean comments for non-obvious 비지니스 reasoning.
```

Replace with:

```markdown
- Permitted: section markers per §4.11, and one-line Korean comments
  for non-obvious 비지니스 reasoning.
```

Rationale: the canonical rule lives in §4.11 now; §4.7 only references it. Cross-reference should point at the source of truth.

- [ ] **Step 5: Verify cross-references resolve**

Run: `grep -n "§4\." /Users/hwpark/Documents/rn-workspace/template-expo-app/AGENTS.md`
Expected output should include references to §4.11 from §4.7, §4.8, and §4.10, and **no remaining reference to §4.7 from §4.10**.

- [ ] **Step 6: Prettier-check**

Run: `cd /Users/hwpark/Documents/rn-workspace/template-expo-app && yarn prettier --check AGENTS.md`
Expected: `All matched files use Prettier code style!`. Run `yarn prettier --write AGENTS.md` if it fails, then diff-inspect.

- [ ] **Step 7: Run lint** (sanity — doc-only change shouldn't affect anything)

Run: `cd /Users/hwpark/Documents/rn-workspace/template-expo-app && yarn lint`
Expected: passes. Doc change shouldn't touch any TS/JS, but AGENTS.md §10 requires lint to pass before finishing.

- [ ] **Step 8: Commit**

```bash
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app add AGENTS.md
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app commit -m "$(cat <<'EOF'
docs: §4.7 / §4.8 / §4.10 cross-references를 §4.11로 정리

- §4.7 section-comments bullet은 §4.11을 가리키도록 단순화하고
  skeleton 예시는 §4.11 순서로 재정렬 (빈 헤더 제거)
- §4.8에 "Section comments follow §4.11" 추가
- §4.10 cross-reference 대상을 §4.7 → §4.11로 변경

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Acceptance-criteria walkthrough

**Files:** none (manual read).

The spec lists six acceptance criteria. Walk through them against the current `AGENTS.md`.

- [ ] **Step 1: Read the spec's acceptance criteria**

Run: `grep -A 10 "## 6. Acceptance criteria" /Users/hwpark/Documents/rn-workspace/template-expo-app/docs/superpowers/specs/2026-05-14-agents-section-comments-design.md`

- [ ] **Step 2: Tick each criterion against AGENTS.md**

For each of the six checkboxes in §6 of the spec, open AGENTS.md and verify:

1. **One canonical section ordering, in §4.11.** Confirm §4.11 exists and lists 9 sections.
2. **No conflicting ordering in §4.7.** §4.7 bullet should say "section comments per §4.11" with no inline list.
3. **§4.8 in scope.** §4.8 should have the "Section comments follow §4.11" bullet.
4. **Migration policy clear.** §4.11 ends with "기존 파일은 일괄 마이그레이션하지 않는다…".
5. **§4.11 example is copy-paste-able.** No `'use client'`, no `useStore`/Zustand imports.
6. **No dangling cross-references.** §4.10 references §4.11, not §4.7.

If any criterion fails, fix it and amend the relevant commit (or add a new commit if cleaner).

- [ ] **Step 3: Confirm clean tree**

Run: `git -C /Users/hwpark/Documents/rn-workspace/template-expo-app status --short`
Expected: empty.

---

## Task 4: Push branch and open PR

**Files:** none.

- [ ] **Step 1: Push the feature branch**

```bash
git -C /Users/hwpark/Documents/rn-workspace/template-expo-app push -u origin feature/agents-section-comments
```
Expected: `Branch 'feature/agents-section-comments' set up to track 'origin/feature/agents-section-comments'`.

- [ ] **Step 2: Open PR against `develop`** (per §5 of AGENTS.md, feature branches merge back into develop)

Run:

```bash
gh pr create \
  --base develop \
  --head feature/agents-section-comments \
  --title "docs: AGENTS.md §4.11 section comments 도입" \
  --body "$(cat <<'EOF'
## Summary

- AGENTS.md에 §4.11 "Section Comments" 추가. React 컴포넌트 / 커스텀 hook
  / shared provider 의 함수 본문 섹션 주석 순서를 9-step canonical 규칙으로
  고정 (ref → context → state → queries → useEffect → useLayoutEffect
  → handle → memorize → callback).
- §4.7 / §4.8 / §4.10 cross-reference 정리.
- 기존 파일은 opportunistic하게만 정리하도록 명시 (일괄 마이그레이션 없음).

Spec: `docs/superpowers/specs/2026-05-14-agents-section-comments-design.md`

## Test plan

- [ ] `yarn prettier --check AGENTS.md` passes
- [ ] `yarn lint` passes
- [ ] AGENTS.md §4.11 example uses RN primitives only (no `'use client'`, no Zustand)
- [ ] §4.7 references §4.11 (no duplicated section list)
- [ ] §4.8 includes "Section comments follow §4.11"
- [ ] §4.10 references §4.11 (not §4.7)

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Expected: PR URL is printed; record it.

- [ ] **Step 3: Confirm PR exists**

Run: `gh pr view --json url,baseRefName,headRefName`
Expected: JSON shows `baseRefName: develop`, `headRefName: feature/agents-section-comments`.

---

## Done criteria

The work is complete when:

1. `feature/agents-section-comments` exists on the remote.
2. A PR targeting `develop` is open with the title and body above.
3. AGENTS.md contains §4.11 and the three cross-reference fixes.
4. `yarn prettier --check AGENTS.md` and `yarn lint` both pass.
5. The spec's six acceptance criteria all tick.

Merge is the user's call (per AGENTS.md PR rules).
