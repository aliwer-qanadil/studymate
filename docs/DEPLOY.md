# Deploying StudyMate (Week 11)

**Status: draft.** The cloud platform is not chosen yet, so the steps below use placeholders such as `<platform>`. Replace them once the platform is selected.

## 1. What gets deployed

| Part | Source folder | Built with | Needs |
| --- | --- | --- | --- |
| Database | (managed by the platform) | PostgreSQL 17 | A database URL, username and password |
| Backend | `backend/` | `backend/Dockerfile` | Environment variables from section 3 |
| Frontend | `frontend/` | `frontend/Dockerfile` (nginx) | The backend address, see section 4 |

## 2. Environments

| Item | Staging | Production |
| --- | --- | --- |
| Purpose | Test changes safely | What the instructor and users see |
| Database | Separate test database | Separate database holding real data |
| Secrets | Own values, set in the platform's settings | Own values, never copied from staging |
| Deploy trigger | Any merged pull request | Only a tagged, tested release (for example `v0.9-beta`) |

## 3. Environment variables

Set these in the platform's settings for each environment. Never put real values in the repository. `.env.example` lists the names only.

| Variable | Used by | Staging example | Production example |
| --- | --- | --- | --- |
| `SPRING_DATASOURCE_URL` | Backend | `jdbc:postgresql://<host>:5432/studymate_staging` | `jdbc:postgresql://<host>:5432/studymate` |
| `SPRING_DATASOURCE_USERNAME` | Backend | set per environment | set per environment |
| `SPRING_DATASOURCE_PASSWORD` | Backend | set per environment | set per environment |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | Backend | `update` | `validate` |
| `SPRING_JPA_SHOW_SQL` | Backend | `false` | `false` |
| `STUDYMATE_DEMO_DATA_ENABLED` | Backend | `true` (optional) | `false` |
| `GMAIL_USER` | Backend (login codes) | staging sender address | production sender address |
| `GMAIL_APP_PASSWORD` | Backend (login codes) | Gmail app password | Gmail app password |

## 4. Steps

1. **Database.** Create two PostgreSQL databases, one for staging and one for production, on the platform. Note each connection string.
2. **Backend.** Create a web service from the repository, with the root folder `backend/` and the Dockerfile. Add the variables from section 3. Deploy. Check that `https://<backend-url>/api/groups` returns JSON.
3. **Frontend.** Create a web service from the repository, with the root folder `frontend/` and the Dockerfile. The nginx file forwards `/api` to the backend container. On a platform that does not run both services in one network, change `proxy_pass` in `frontend/nginx.conf` to the backend's public address, then deploy.
4. **Check the CORS setting.** The backend must trust the frontend's public address. Confirm that a sign-in request from the deployed site is not rejected with "Invalid CORS request".
5. **Smoke test.** Open the frontend URL on a phone, sign in with a real student ID, and create a group. Record anything that fails in the Week 10 test table.

## 5. Rollback

Redeploy the previous image or commit from the platform's deployment history. Test the rollback once on staging before it is needed.

## 6. Known problems after deployment

Record here what broke after the first deployment and how it was solved.

| Problem | Cause | Fix |
| --- | --- | --- |
| | | |
