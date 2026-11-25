# GitHub Actions

| Workflow | When | What it does |
| --- | --- | --- |
| `ci.yml` | Every pull request and every push to `main` | **frontend**: `npm ci`, `npm run lint`, `npm run build`. **backend**: `mvn test` against a temporary PostgreSQL (API tests for sign-in, applying and organizer decisions, plus unit tests). **docker**: builds both images, starts the whole stack and waits until every health check passes. |
| `deploy-production.yml` | A tag `v*` is pushed, or by hand from the Actions tab | Runs `ci.yml`; if it passes, asks Render to build the tagged commit for production, then waits until `/api/health` answers. Run it by hand from an older tag to roll back (pick the tag under **Use workflow from**; from `main` it is rejected). |

Staging needs no workflow: Render deploys `main` by itself once `ci.yml` has passed (`autoDeployTrigger: checksPass` in `render.yaml`).

A red mark on a pull request means a check failed. Open the run on GitHub to see which step.
The secrets the production workflow needs are listed in [`docs/DEPLOY.md`](../../docs/DEPLOY.md).
