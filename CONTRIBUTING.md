# Contributing

## Development Principles

- Work from the active Spec Kit feature: `specs/001-create-taskify`.
- Read `spec.md`, `plan.md`, and `tasks.md` before implementation.
- Keep changes small and mapped to task IDs.
- Add or update tests alongside code changes.
- Do not include production-sensitive data in prompts, fixtures, logs, or tests.

## Code Style

- Use TypeScript strict-mode patterns already present in the repo.
- Prefer existing services, hooks, components, and utilities before adding new abstractions.
- Validate inputs at API boundaries.
- Keep documentation aligned with API, setup, and workflow changes.

## Checks Before PR

Backend:

```sh
cd backend
npm test
npm run lint
npm run build
```

Frontend:

```sh
cd frontend
npm test
npm run lint
npm run build
```

Run Playwright for user-facing workflow changes:

```sh
cd frontend
npm run test:e2e
```

## Commit Conventions

Use concise imperative commit messages:

- `docs: add developer workflow guide`
- `test: cover comment authorization`
- `fix: validate task status updates`

Reference relevant task IDs in commit bodies when useful.

## Pull Request Expectations

Each PR should include:

- Summary of changes.
- Task IDs completed.
- Tests and checks run.
- Documentation updates.
- Risks, assumptions, and trade-offs.

Security-sensitive PRs must call out validation, authorization, data flow, and failure-mode impacts.
