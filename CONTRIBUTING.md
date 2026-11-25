# Contributing to Study Mate

How the Study Devs team changes this repository. New to the project? Start with the [README](README.md) to run it.

## Branches

- `main` is the only long-lived branch. It is protected: changes arrive only through a pull request with one approving review from another team member, and CI must pass.
- Work happens on a short branch from `main`, named after the issue or the kind of change:

  | Kind | Name | Example |
  | --- | --- | --- |
  | Bug fix | `fix/<issue>-<short-name>` | `fix/7-application-form` |
  | Feature (not during the freeze) | `feat/<short-name>` | `feat/group-chat` |
  | Docs, tests, chores | `docs/…`, `test/…`, `chore/…` | `docs/deploy-guide` |

- Delete the branch after its pull request is merged (GitHub does this automatically for this repository).

## Commits

[Conventional Commits](https://www.conventionalcommits.org/), in English, present tense:

```
fix(create): show an error under each empty or too long field

Explain what was wrong and why this fixes it, in plain words.

Closes #9
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`. Scope is the area (`apply`, `browse`, `auth`, `deploy`…).

## Pull requests

1. Link the issue: `Closes #12` in the description closes it on merge.
2. Describe what changed and how you tested it (steps, screenshots for UI).
3. CI must be green: frontend lint and build, backend tests, Docker stack health.
4. **Another member reviews and approves.** The author never approves their own pull request.
5. Merge with **Create a merge commit**, so each fix keeps its own commits and issue reference in the history.
6. After the merge, staging redeploys by itself. Check the change there.

## Issues and severity

Every defect is a GitHub Issue titled `[Severity] Short description`, with steps to reproduce, expected and actual results and a screenshot, and labels for severity and area (`frontend`, `backend`, `auth`).

| Severity | Meaning | Handling |
| --- | --- | --- |
| Critical | A Must-have flow cannot be completed, data is lost, or the app crashes | Fix before anything else; blocks a release |
| Major | Wrong results, or users need help to continue | Owner and date on the Kanban board; fixed or a written decision before a release |
| Minor | Cosmetic or small friction | Fix when time allows, or document as a known limitation |

## Code freeze

From **25 November 2026** until the final defense:

- No new features are merged. Only fixes for bugs already logged as GitHub Issues.
- Every fix goes through a pull request and a review, is checked on **staging**, and reaches production only with the next release tag.
- A change that is not a logged bug fix breaks the freeze and must be justified at the defense.

## Releases

1. All Critical issues closed; every open Major issue has a written decision in [`docs/RELEASE_NOTES.md`](docs/RELEASE_NOTES.md).
2. The manual test table ([`docs/qa/test-cases.md`](docs/qa/test-cases.md)) passes on staging.
3. Tag `main` and push the tag; production deploys from it ([`docs/DEPLOY.md`](docs/DEPLOY.md)):

   ```bash
   git tag -a v1.0.0 -m "v1.0.0" && git push origin v1.0.0
   ```

4. Publish a GitHub Release for the tag with the notes, then re-run the test table on production.

## Code style

- Frontend: `npm run lint` must pass. Components are small and grouped by page under `src/components/<page>/`. All visible text goes through `t("…")` with the same key in `en.js`, `ru.js` and `kz.js`.
- Backend: controller → service → repository. Validation on request records (`@NotBlank`, `@Size`…); business rules in services, answered as `409` with a clear message.
- Comments explain why, in plain English. No secrets in code, commits or issues; use `.env` locally and the platform's settings in the cloud.
