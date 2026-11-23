# CLAUDE.md

@AGENTS.md

> Claude Code overlay for **template-expo-app**.
> `AGENTS.md` (imported above) is the cross-agent source of truth.
> Everything below applies **only** when Claude Code is the active agent.

## Claude Code 전용 규칙

### Plan Mode

- 큰 변경(파일 3개 이상 / 새 기능 / 마이그레이션)은 plan mode 로 진행한다.

### Superpowers Skill 사용

- 작업 시작 전 관련 superpowers 스킬 적용 여부를 확인한다:
  - 새 기능 / 모호한 요구사항 → `superpowers:brainstorming`
  - 승인된 스펙의 구현 계획 작성 → `superpowers:writing-plans`
  - 계획 실행 → `superpowers:subagent-driven-development` 또는
    `superpowers:executing-plans`
  - 버그 / 회귀 / 예상치 못한 동작 → `superpowers:systematic-debugging`

### Visual Companion

- Visual Companion 사용과 목업 개수는 `AGENTS.md` 의 "Design & UI" 를 따른다.
- 그 외 단계는 [디자인 워크플로우](docs/agents/workflows/design-workflow.md) 의
  6 단계를 따른다.
- 최종 합의된 디자인만 `src/` 에 반영한다.

### 금지 사항 (사용자가 명시적으로 요청하지 않은 경우)

- `git push --force` 금지.
- `git reset --hard`, `git branch -D` 등 파괴적 git 명령 금지.
- `main` / `develop` 브랜치로 직접 push 금지 — 반드시 PR 경유.
- secret-bearing 파일 변경/커밋 금지: `.env`, `.env.local`,
  `google-services.json`, `GoogleService-Info.plist`.
- 사용자에게 검토 기회 없이 마이그레이션 스크립트 실행 금지.
