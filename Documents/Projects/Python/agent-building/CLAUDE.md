# Software Factory – Project Instructions for Claude Code

This file is loaded automatically at the start of every Claude Code session.
It captures the rules, patterns, and workflow this project follows.
Read it before editing any file or writing any code.

---

## 1. Stack

> Fill in your actual stack below. Examples are shown.

- **Frontend**: Next.js 14 (App Router) with TypeScript
- **Backend**: Node.js services
- **Database**: Prisma + PostgreSQL
- **Auth**: Auth.js
- **Email**: Resend (transactional)
- **Background jobs**: BullMQ
- **Testing**: Jest + React Testing Library

---

## 2. Common Commands

```bash
npm run dev          # start dev server
npm test             # run unit tests
npm run typecheck    # type-check the project
npm run lint         # lint the project
npx prisma migrate dev   # run migrations locally
```

---

## 3. Architecture Rules

- Business logic lives in `services/` or domain modules — not in API routes or components.
- API routes stay thin: validate input, call a service, return a response.
- Use the existing email template system. Do not introduce a second one.
- All scheduled work goes through the BullMQ worker in `workers/`. Do not add cron jobs.
- Tenant isolation is enforced at the service layer, not the route layer.
- Use the `requireSameTenant` helper on every cross-tenant boundary.

---

## 4. Key Documentation

Consult these before guessing at patterns or decisions:

| File | What it covers |
|---|---|
| `docs/architecture.md` | Service boundaries, request flow, tenant isolation model |
| `docs/billing.md` | Stripe webhooks, invoice lifecycle, proration rules |
| `docs/email.md` | Template system, Resend setup, available templates |
| `docs/jobs.md` | BullMQ queue names, job patterns, retry/backoff policy |
| `docs/db.md` | Schema conventions, soft-delete rules, tenant patterns |
| `docs/runbooks/` | Production incident runbooks |
| `prisma/schema.prisma` | Source of truth for the data model |
| `docs/adr/` | Past architecture decisions — read before contradicting one |

For library-specific questions (Next.js, Prisma, Auth.js, BullMQ, Resend) always check the official docs for the **installed version** rather than relying on training memory.

---

## 5. Testing Conventions

- Every feature needs at minimum: a success test, a validation-failure test, and a not-found test.
- Use test data builders from `test/builders/` — do not create inline setup objects.
- Do not mock the database unless existing tests already do so.
- Acceptance tests live in `test/acceptance/` and exercise the full user story.
- Unit tests live next to the code they cover.

---

## 6. Coding Conventions

- Match the naming, folder structure, and error-handling patterns of similar existing features.
- Reuse existing helpers, services, and templates — do not create duplicates.
- Do not refactor unrelated code inside a feature branch.
- Do not add new npm dependencies without explicit instruction.
- Reminder columns follow the `last<Action>SentAt` naming pattern.

---

## 7. Security Rules

- Never log raw payment payloads.
- Never return database errors directly to the client.
- Never commit `.env`, `.key`, `.pem`, `secrets.json`, or `creds.md` files.
- Always check tenant ownership before acting on a resource.
- Rate-limit sensitive endpoints (auth, payment triggers, email sends).

---

## 8. Don't Do

- Do not edit migrations after they have been merged.
- Do not store deduplication state in memory (use a DB column instead).
- Do not add a new scheduler when BullMQ already handles jobs.
- Do not run frontend-builder before backend-builder has finished.
- Do not open a PR before the implementation-validator has run.

---

## 9. Workflow: The Software Factory Chain

When building a feature, follow this chain in order.
Each step runs as a subagent or skill. Human approval is required at Steps 3 and 5.

```
1. codebase-researcher   → map the relevant code
2. story-writer          → produce a user story + acceptance criteria
3. ── HUMAN APPROVAL ──  → approve story (or request changes / reject)
4. spec-writer           → produce a technical brief
5. ── HUMAN APPROVAL ──  → approve brief (or request changes / reject)
6. backend-builder       → implement backend + unit tests
7. frontend-builder      → implement frontend + component tests
8. test-verifier         → write acceptance tests against the story
9. implementation-validator → report gaps grouped by severity
10. ── HUMAN APPROVAL ── → final review before opening PR
```

To run the full chain, open Claude Code and type:

```
/feature-factory

I want to <describe the feature in one sentence>.
```

---

## 10. The Seven Subagents

All agent files live in `.claude/agents/`. Each one has a focused job and restricted tools.

| Agent | Job | Tools |
|---|---|---|
| `codebase-researcher` | Map relevant code, patterns, and risks before anything is built | Read, Grep, Glob |
| `story-writer` | Turn a rough idea into a user story with acceptance criteria and edge cases | Read |
| `spec-writer` | Turn the approved story into a technical brief (data model, API, UI, tests, risks) | Read, Grep, Glob |
| `backend-builder` | Build services, API routes, jobs, migrations, and unit tests | Read, Edit, Write, Bash |
| `frontend-builder` | Build components, pages, hooks, and component tests | Read, Edit, Write, Bash |
| `test-verifier` | Write acceptance tests that verify every criterion in the user story | Read, Edit, Write, Bash |
| `implementation-validator` | Compare implementation vs. story and brief; report critical / important / minor gaps | Read, Grep, Glob |

**Key rules:**
- Read-only agents (`codebase-researcher`, `spec-writer`, `implementation-validator`) can run in parallel.
- Write agents (`backend-builder`, `frontend-builder`, `test-verifier`) must run in sequence.
- The validator never edits files. It only reports. The builder fixes.

---

## 11. Skills

Skills live in `.claude/skills/<name>/SKILL.md` and encode repeatable procedures.

| Skill | When it triggers |
|---|---|
| `build-with-tests` | When asked to build, implement, add, extend, or ship a feature |
| `feature-factory` | When asked to run the full chain end to end |

To add a new skill, ask Claude:
```
Create a Claude Code skill at .claude/skills/<name>/SKILL.md that captures <procedure>.
Show me the file before saving it.
```

---

## 12. Hooks

Hooks live in `.claude/hooks/` and run automatically — they cannot be skipped.

| Hook | Lifecycle event | What it does |
|---|---|---|
| `pre-commit.sh` | `PreToolUse` (Bash) | Blocks commits containing `.env`, `.key`, `.pem`, `secrets.json`, `creds.md` |
| (optional) formatter | `PostToolUse` (Edit) | Runs the project formatter after every AI edit |
| (optional) typecheck | `Stop` | Runs typecheck and tests before Claude finishes a response |

---

## 13. Growing This File

Every time the AI makes a mistake that surprises you, ask:
*"Would a rule in CLAUDE.md have prevented this?"*

If yes, add the rule. Keep the file between **100 and 300 lines**.
If a section grows into a multi-step procedure, move it to a skill instead.

---

## 14. Context Hygiene

- Start each major feature in a **fresh Claude Code session**. Paste only the brief.
- If the AI makes a wrong *architectural* assumption, discard the chat and start over with a corrected prompt.
- If the AI makes a small typo or surface error, correct it inline.
- "Explore before you build": always ask the AI to map the codebase before writing any code.

---

## 15. PR and Review Standards

Every PR produced by the factory is reviewed by `@pr-reviewer` before a human merges it.

The reviewer checks:
- **Scope**: one clear purpose, no unrelated refactoring, no unrelated files
- **Tests**: core behaviour covered, failure cases tested, existing tests still pass
- **Security**: auth checks present, tenant isolation preserved, no secrets in logs
- **Architecture**: business logic out of routes/components, patterns from this file respected, no unjustified new dependencies
- **Docs**: README or feature docs updated for user-facing changes

A PR is not approved by the AI — it is *reviewed*. Merge decisions stay with a human.