# GitHub development workflow

Use this branch flow for project changes so feature work stays isolated until it is ready to integrate.

## Branch roles

| Branch | Purpose | Changes made there |
| --- | --- | --- |
| `main` | Release branch and source for the deployed version | Release merges only |
| `staging` | Shared integration branch for reviewed work | Feature pull request merges |
| `feature/<task-id>-<short-name>` | Isolated development branch for one backlog feature or task | Feature implementation, tests, and related documentation |

Examples: `feature/des-01-nextjs-bootstrap`, `feature/eng-01-nutrition-engine`.

## Workflow

1. Start from the latest `staging`. If `staging` does not exist yet, create it from `main`.
2. Create one feature branch from `staging` for the selected backlog task, using the task ID and a short kebab-case name.
3. Make the implementation, tests, and directly related documentation changes on that feature branch. Keep each branch focused on one task; do not mix unrelated backlog items.
4. Commit and push the feature branch. Do not commit feature work directly to `main` or `staging`.
5. Open a pull request from `feature/*` into `staging`. Include the backlog ID, behavior changed, verification commands and observed results, and remaining limitations.
6. After review and successful verification, merge the feature pull request into `staging`. Re-run integration checks there.
7. When the release candidate on `staging` passes the release checklist, open a separate pull request from `staging` into `main`. Merge and deploy only with the required owner approval.
8. After a release PR is merged, sync the new `main` history back into `staging` through a dedicated feature branch and PR before the next release promotion. Create the sync branch from the latest `staging`, merge the latest `main` into it, resolve any documentation conflicts using the most recent verified state, then merge its PR into `staging`. Never update the shared `staging` branch directly.

## Guardrails

- Never force-push shared branches or rewrite their history.
- Do not mark a backlog item done until its acceptance criteria and verification evidence are recorded.
- Keep secrets, credentials, and private user data out of commits.
- A branch workflow does not authorize changing repository visibility, repository settings, or deployment infrastructure.
- Keep simulated data, unknown nutrition, and stock limitations explicit in code and documentation.
