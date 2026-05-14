# AGENTS.md §4.11 Section Comments — Design Spec

- **Date:** 2026-05-14
- **Owner:** hyunwoo4847@gmail.com
- **Status:** Approved for implementation
- **Target file:** `AGENTS.md`

## 1. Goal

Add a single, canonical rule to `AGENTS.md` that defines the **fixed
ordering of section comments** inside every React function body in
`src/` (components, custom hooks, providers). Today the ordering only
exists as a bullet in §4.7 (Provider Pattern) and is incomplete
(no `// ref`, no `// callback`, no `// useLayoutEffect`).

A consistent ordering makes provider/component/hook files predictable
to scan and to diff, and removes the small per-PR friction of deciding
where each block of hooks belongs.

## 2. Non-goals

- **Not a bulk migration.** Existing files are not rewritten in one
  pass. They're updated opportunistically when touched for other work.
- **Not a new state-management decision.** The rule does not introduce
  Zustand or any other library to the project.
- **Not a Server Component / RSC rule.** This project is Expo / React
  Native; there is no `'use client'` directive in this repo, and the
  rule is scoped accordingly.

## 3. Decisions

| #   | Decision                                                                              | Rationale                                                                                                                                                                                                                                                                                                                        |
| --- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D1  | Scope = all RN components, custom hooks (`useXxx.tsx`), shared providers under `src/` | No RSC in this project; uniform application is simpler than carving out screens.                                                                                                                                                                                                                                                 |
| D2  | Replace §4.7's section list with a pointer to the new §4.11                           | One source of truth; avoids drift between two near-duplicate lists.                                                                                                                                                                                                                                                              |
| D3  | Keep `// store` and `// hooks` slots in the canonical list                            | `// store` documents the Zustand selector slot for future use (`사용 시에만`). `// hooks` covers the residual category — custom hooks that aren't refs / context / state / queries (e.g. `useColorScheme`, `useRouter`). Both slots are omitted from a function body that doesn't use them, per the "omit unused sections" rule. |
| D4  | Place the rule as a new §4.11 at the end of §4 (Coding Conventions)                   | Cross-cutting convention; doesn't belong inside any single existing subsection.                                                                                                                                                                                                                                                  |
| D5  | §4.8 (Screen Components) gets a one-line pointer to §4.11                             | Makes scope explicit so screens aren't read as exempt.                                                                                                                                                                                                                                                                           |
| D6  | No bulk migration — opportunistic cleanup only, same PR as the touching work          | Matches the wording in the original draft and keeps the change reviewable.                                                                                                                                                                                                                                                       |

## 4. Canonical section order (11 sections)

In fixed order. **Omit unused sections — never leave an empty header.**

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand selector (사용 시에만)
5. `// hooks` — 그 외 커스텀 hook 호출 (`useRouter`, `useColorScheme` 등)
6. `// queries` — React Query hook (`useXxx({...})`, mutation hook 포함)
7. `// useEffect`
8. `// useLayoutEffect`
9. `// handle` — 이벤트 핸들러 / 액션 함수 (`handleXxx`) 등 일반 함수
10. `// memorize` — `useMemo`
11. `// callback` — `useCallback`

Within a single section, multiple lines are free-form. Co-located
sub-components in the same file (e.g. `UserItem` inside `UserList.tsx`)
follow the same ordering.

## 5. AGENTS.md edits

Three concrete edits, no other changes.

### 5.1 Add §4.11 (new subsection)

Insert after §4.10 (Comments), before §5 (Branch Naming Convention).

````markdown
### 4.11 Section Comments

React 컴포넌트, 커스텀 hook (`useXxx.tsx`), shared provider 의 함수
본문은 아래 섹션 주석으로 구분한다. **순서는 고정**이며 사용하지 않는
섹션은 주석을 **생략**한다 (빈 헤더를 남기지 않는다).

순서:

1. `// ref` — `useRef`
2. `// context` — `useContext`
3. `// state` — `useState`, `useReducer`
4. `// store` — Zustand selector (사용 시에만)
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
````

### 5.2 Update §4.7 (Provider Pattern)

Replace the existing section-comments bullet:

> **Before:**
> `Group blocks inside the component with **Korean section comments**: // state, // context, // hooks, // queries, // useEffect, // handle, // memorize.`
>
> **After:**
> `Group blocks inside the component with **section comments** per §4.11.`

Also reorder the `FooProvider` skeleton example in §4.7 to match
§4.11 (e.g. `// context` precedes `// state`) and drop any empty
section headers from the skeleton per the "omit unused sections"
rule.

### 5.3 Update §4.8 (Screen Components)

Add a new final bullet:

> `Section comments follow §4.11.`

## 6. Acceptance criteria

A reader following only `AGENTS.md` should be able to:

- [ ] Find one canonical section ordering, in §4.11.
- [ ] See no conflicting ordering in §4.7. §4.7 references §4.11.
- [ ] Understand that screen components (§4.8) are in scope.
- [ ] Understand the migration policy (opportunistic, not bulk).
- [ ] Use the §4.11 example as a copy-paste starting point without
      imports for libraries that aren't in the stack (no `useStore` /
      Zustand import, no `'use client'`). The `// store` slot is
      mentioned in the canonical list with a "사용 시에만" caveat but
      is absent from the example body.

## 7. Out of scope (deferred)

- **Lint rule** that enforces section ordering automatically. The
  rule is doc-only for now; a future eslint plugin could mechanise it.
- **Migrating existing files** under `src/shared/providers/`,
  `src/domain/*/queries/`, and `src/app/`. They follow the opportunistic
  policy in §4.11.
- **Adopting Zustand** (or any other store library). The `// store`
  slot is documented for forward-compatibility but is not used until
  a store library is actually added to the stack.

## 8. Verification

- `yarn prettier --check AGENTS.md` produces no diff.
- `yarn lint` still passes (doc-only change, but run for safety).
- Manual read of `AGENTS.md` against the §6 acceptance criteria.
