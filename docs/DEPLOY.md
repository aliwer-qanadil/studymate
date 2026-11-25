# Deploying Study Mate

This guide sets up **staging** and **production** from zero, so that any team member can repeat it. It takes about 40 minutes the first time. Nothing in the code needs to change: every setting is an environment variable.

## 1. What runs where

| Part | Where | Why this choice |
| --- | --- | --- |
| Website (React + nginx) | Render web service, Docker, `frontend/Dockerfile` | Free plan, builds straight from GitHub, HTTPS included |
| API (Spring Boot) | Render web service, Docker, `backend/Dockerfile` | Same |
| Database (PostgreSQL 17) | Neon, one database per environment | Free plan has no 30-day expiry and allows separate databases; Render's free database expires after 30 days and allows only one |
| Login-code email | Brevo HTTPS API | Render's free plan blocks outgoing SMTP ports, so Gmail SMTP does not work there. Brevo's free plan sends 300 emails a day |

`render.yaml` in the repository describes all four Render services (a "Blueprint"), so they are created in one step.

| | Staging | Production |
| --- | --- | --- |
| Purpose | Test changes safely | What the instructor and users see |
| Services | `studymate-staging`, `studymate-api-staging` | `studymate`, `studymate-api` |
| Database | Neon database `studymate_staging` | Neon database `studymate` (separate) |
| Secrets | Own Brevo key, own database password | Own values, never copied from staging |
| Demo data | On | Off |
| Deploy trigger | Every merge into `main`, after CI passes (Render `autoDeployTrigger: checksPass`) | Only a pushed release tag `v*` whose tests pass (`.github/workflows/deploy-production.yml`) |

## 2. Create the databases (Neon)

1. Sign up at https://neon.tech with the team's GitHub account.
2. Create a project **studymate**, PostgreSQL 17, region **AWS Europe Central (Frankfurt)** (closest to Render's Frankfurt region).
3. The project starts with a database `neondb`. In **Databases**, create two: `studymate` and `studymate_staging`, owned by the default role.
4. Open **Connect**, pick each database in turn and copy the connection string. It looks like
   `postgresql://neondb_owner:xxxx@ep-xxx.eu-central-1.aws.neon.tech/studymate?sslmode=require`.
   Keep both strings for step 4. They are secrets: don't paste them into chats, issues or files in the repository.

The API creates its tables on the first start (`SPRING_JPA_HIBERNATE_DDL_AUTO=update`), so no SQL needs to be run.

## 3. Set up email (Brevo)

1. Sign up at https://www.brevo.com (free plan).
2. **Senders, domains & dedicated IPs → Senders → Add a sender**: the team's address, e.g. `studymate.sdu@gmail.com`. Confirm the email Brevo sends to it. This is `MAIL_FROM`.
3. **SMTP & API → API keys → Generate a new API key** twice: `studymate-staging` and `studymate-production`. Each is a `BREVO_API_KEY`.

Login emails go to `<studentId>@sdu.edu.kz`. Send yourself a code after deploying and check the spam folder the first time.

## 4. Create the services (Render Blueprint)

1. Sign up at https://render.com with GitHub and allow access to the `studymate` repository.
2. **New → Blueprint**, choose the repository, branch `main`. Render reads `render.yaml` and lists four services.
3. Render asks for the values marked `sync: false`:

   | Service | `DATABASE_URL` | `BREVO_API_KEY` | `MAIL_FROM` |
   | --- | --- | --- | --- |
   | `studymate-api-staging` | Neon string for `studymate_staging` | staging key | sender address |
   | `studymate-api` | Neon string for `studymate` | production key | sender address |

4. Click **Apply**. The first builds take 5–10 minutes.
5. **Check the addresses.** Render names each service `https://<service-name>.onrender.com`. If a name was taken, Render adds a suffix. In that case, open the website service → **Environment** and set `BACKEND_URL` to the API's real address (no slash at the end), and on the API service set `CORS_ALLOWED_ORIGINS` to the website's real address. Save; Render redeploys.

Staging is now live and redeploys by itself after each merge into `main`. The two production services are created but stay on the first build until a release is deployed (next step).

## 5. Connect the production release workflow (GitHub)

Production deploys only from a release tag, through Render "deploy hooks".

1. On Render, open `studymate-api` → **Settings → Deploy Hook** and copy the URL. Do the same for `studymate`.
2. On GitHub: **Settings → Environments → New environment** `production`. Under **Deployment branches and tags** choose *Selected branches and tags* and add the tag rule `v*`.
3. In that environment add:
   - secret `RENDER_DEPLOY_HOOK_API` = the `studymate-api` hook URL
   - secret `RENDER_DEPLOY_HOOK_WEB` = the `studymate` hook URL
   - variable `PRODUCTION_URL` = `https://studymate-edrp.onrender.com` (the address Render gave the website)
4. Release:

   ```bash
   git checkout main && git pull
   git tag -a v0.9-beta -m "v0.9-beta"
   git push origin v0.9-beta
   ```

   The **Deploy production** workflow runs the tests, asks Render to build exactly the tagged commit, then waits until `https://…/api/health` answers `UP`.

## 6. Check the deployment

From a phone or another computer (not the one you deployed from):

1. Open `https://<api>/api/health` → `{"status":"UP","database":"UP"}`.
2. Open the website, sign in with a real student ID and the emailed code (a new, empty account).
3. Create a group. In a private window, sign in as a second student, ask to join, then accept the request as the first one.
4. Record the results in the production column of [`qa/test-cases.md`](qa/test-cases.md).

The free plan stops a service after 15 minutes without traffic. The first request after that takes up to a minute; this is expected.

## 7. Roll back

| What broke | How to roll back |
| --- | --- |
| Production after a release | GitHub → **Actions → Deploy production → Run workflow**. Under **Use workflow from**, switch to **Tags** and pick the previous tag (e.g. `v0.9-beta`), and enter the same tag in the field below. It runs the tests and redeploys that commit. From the terminal: `gh workflow run deploy-production.yml --ref v0.9-beta -f tag=v0.9-beta`. Leaving **Use workflow from** on `main` does not work: the `production` environment accepts only `v*` tags, so GitHub rejects the deploy. Or, faster: Render → service → **Events** → previous deploy → **Rollback** (do it for both services). |
| Staging after a merge | Revert the pull request on GitHub (**Revert** button), merge the revert; staging redeploys. Or use **Rollback** in Render. |
| A bad database change | Neon → **Branches** → restore the database to a time before the deploy (the free plan keeps a few hours of history; check the restore window in the project settings). |

Rollback rehearsal (do it once on staging, before the defense): note the current deploy in Render's **Events**, click **Rollback** on the one before it, wait until `/api/health` is `UP`, check the site, then roll forward again with **Deploy latest commit**. Write the date and result in the table below.

## 8. Settings reference

All variables are listed in the [README](../README.md#environment-variables). Values that differ between environments:

| Variable | Staging | Production |
| --- | --- | --- |
| `DATABASE_URL` | Neon `studymate_staging` | Neon `studymate` |
| `BREVO_API_KEY` | staging key | production key |
| `STUDYMATE_DEMO_DATA_ENABLED` | `true` | `false` |
| `CORS_ALLOWED_ORIGINS` | staging website address | production website address |
| `BACKEND_URL` (website) | staging API address | production API address |

## 9. Problems found while preparing the deployment, and how they were solved

| Problem | Cause | Fix |
| --- | --- | --- |
| Every sign-in from the deployed site would fail with 403 "Invalid CORS request" | Spring compared the browser's `Origin` with the `Host` the proxy passed on; behind a cloud proxy they never match. Allowed origins were also hard-coded to localhost and `*.trycloudflare.com` | nginx no longer forwards `Origin` (the browser only talks to its own site, and sign-in uses a token header, not cookies). The API's own CORS list now comes from `CORS_ALLOWED_ORIGINS` ([#20](https://github.com/aliwer-qanadil/studymate/issues/20), [#4](https://github.com/aliwer-qanadil/studymate/issues/4)) |
| No login emails on Render | Render's free plan blocks outgoing SMTP ports | Added `MAIL_PROVIDER=brevo`, which sends through Brevo's HTTPS API |
| The website could not find the API | `proxy_pass http://backend:8080` only exists inside Docker Compose | nginx config is now a template; `BACKEND_URL` and `PORT` come from the environment, with a trailing slash removed automatically |
| Neon and Render give `postgres://user:pass@host/db`, Spring wants `jdbc:postgresql://host/db` | Different URL formats | The API converts `DATABASE_URL` itself at start-up |
| "Today" was wrong between 00:00 and 05:00 | Cloud servers run on UTC | The API uses `APP_TIME_ZONE` (default `Asia/Almaty`) |
| API ran out of memory on 512 MB | Java's default heap size ignores small containers | `-XX:MaxRAMPercentage=75` in the Docker image |
| Docker health check always failed (Week 10, [#5](https://github.com/aliwer-qanadil/studymate/issues/5)) | The check used a shell feature the image's `sh` lacks | Health check calls `GET /api/health` through `bash`; Render uses the same endpoint |

**After the first real deployment**, add anything else that broke here:

| Date | Environment | Problem | Fix | Issue |
| --- | --- | --- | --- | --- |
| 2026-11-25 | Staging | API stopped at start-up: `password authentication failed for user 'neondb_owner'` | The pasted Neon string had a wrong password. Copied it again from Neon **Connect** with **Show password** on | |
| 2026-11-25 | Production | `studymate.onrender.com` and `studymate-api.onrender.com` were already taken by other Render users, so the services got `studymate-edrp` and `studymate-api-ejga` | Set `BACKEND_URL` and `CORS_ALLOWED_ORIGINS` to the real addresses in Render and in `render.yaml` (step 4.5) | |
| 2026-11-25 | Production | Running **Deploy production** by hand for `v0.9-beta` failed: `Branch "main" is not allowed to deploy to Production due to environment protection rules` | A run started by hand uses `main` unless told otherwise, and the environment accepts only `v*` tags. Ran it from the tag (`--ref v0.9-beta`); section 7 now says so | |

**Rollback rehearsal:**

| Date | Environment | From → to | Result |
| --- | --- | --- | --- |
| 2026-11-25 | Staging (`studymate-api-staging`, `studymate-staging`) | `e167643` → `ce67484` (**Rollback** to the previous deploy), then forward to `e167643` (**Deploy latest commit**) | Passed. Rollback took about 2.5 minutes; after it and after rolling forward, `/api/health` on the API and through the website answered `{"status":"UP","database":"UP"}` and the site loaded |
