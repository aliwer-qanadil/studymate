# Study Mate

**Study Mate helps SDU students find classmates for in-person study groups: post a group, ask to join one, and let a transparent match score help the organizer decide.**

Built by the **Study Devs** team for the SOE 205 Capstone Project.

| | |
| --- | --- |
| Production | https://studymate-edrp.onrender.com *(goes live after the first release deploy, see [Deployment](#deployment))* |
| Staging | https://studymate-staging.onrender.com |
| Release | [`v0.9-beta`](https://github.com/aliwer-qanadil/studymate/releases/tag/v0.9-beta) — [release notes](docs/RELEASE_NOTES.md) |
| Code freeze | **From 25 November 2026.** Only fixes for bugs logged in GitHub Issues are merged until the final defense ([rules](CONTRIBUTING.md#code-freeze)). |

![Browse page](docs/screenshots/browse.png)

## Contents

[Problem and users](#the-problem-and-who-it-is-for) · [Features](#features) · [Screenshots](#screenshots) · [Tech stack](#tech-stack) · [Architecture](#architecture) · [Run it locally](#run-it-locally-about-10-minutes) · [Environment variables](#environment-variables) · [Tests](#running-the-tests) · [Deployment](#deployment) · [Documentation](#documentation) · [Team](#team)

## The problem and who it is for

Students understand hard topics faster when they study together, but finding a classmate who takes the same course, is free at the same time and is at a similar level takes a lot of messaging. Group chats are noisy, and organizers can't tell who will actually fit their session.

Study Mate is for **SDU students**: the **organizer** who wants a few people for a focused session, and the **applicant** looking for a group that fits their course, schedule and level. Guests can look around before signing in.

## Features

- **Sign in with your SDU student ID.** A one-time code is emailed to `<studentId>@sdu.edu.kz`; the first sign-in creates the account. No passwords to store or leak.
- **Browse upcoming groups** with subject, place, time and free seats. Filter by subject, place, part of day, today or the next 7 days, or search; groups in your own subjects come first.
- **Create a group** with course, level, place on campus, an exact spot shown only to accepted members, day, time, size and study preferences. Every field shows its own error.
- **Ask to join** with a short application: course, level, free time, preferences and a note. Answers are prefilled from your profile.
- **Compatibility score** (0–100 %): subject 40, time overlap 30, level 20, preferences 10, with a breakdown for each part. It helps the organizer; it never decides alone.
- **Organizer review:** applicants sorted by match, accept or decline, the group closes itself when full.
- **Request status** for applicants (waiting, accepted, not accepted), cancel a request, add an accepted meeting to your calendar.
- **Profile:** username, subjects with levels, usual free time, study style, favourite places and your session history.
- **Kazakh, Russian and English**, dark mode, works on phones (checked at 360, 768 and 1280 px).

## Screenshots

| Sign in | Ask to join (prefilled from the profile) |
| --- | --- |
| ![Sign in](docs/screenshots/login.png) | ![Application form](docs/screenshots/apply.png) |
| **Organizer reviews applicants** | **Create a group** |
| ![Applicants](docs/screenshots/applicants.png) | ![Create](docs/screenshots/create.png) |
| **Group details after being accepted** | **Profile** |
| ![Group details](docs/screenshots/group-detail.png) | ![Profile](docs/screenshots/profile.png) |
| **My requests** | **On a phone** |
| ![Requested](docs/screenshots/requested.png) | ![Mobile](docs/screenshots/mobile-browse.png) |

## Tech stack

| Part | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, React Router 7; served by nginx |
| Backend | Java 21, Spring Boot 4 (Web MVC, Data JPA, Validation, Mail) |
| Database | PostgreSQL 17 |
| Auth | Emailed one-time codes (BCrypt-hashed), random session tokens stored as SHA-256 hashes |
| Email | SMTP (e.g. Gmail) or the Brevo HTTPS API |
| Tooling | Docker Compose, GitHub Actions, Render (hosting), Neon (managed PostgreSQL), Figma, Trello |

## Architecture

```mermaid
flowchart LR
    B[Browser<br/>React app] -- "HTTPS: pages and /api/*" --> W[Website service<br/>nginx]
    W -- "/api/* (proxy)" --> A[API service<br/>Spring Boot]
    A -- JDBC --> D[(PostgreSQL)]
    A -- "login codes" --> M[Email: SMTP or Brevo API]
```

The browser only ever talks to the website's address; nginx forwards `/api` to the backend, so there are no cross-site requests and no CORS setup to get wrong. Every user-specific endpoint (`/api/users/{id}/...`) needs the session token of that same user. The database tables are described in [`docs/erd/Current_Schema.md`](docs/erd/Current_Schema.md), and every endpoint in [`docs/API.md`](docs/API.md).

```
.
├── backend/            Spring Boot API (controller → service → repository)
├── frontend/           React app and its nginx config
├── docs/               SRS, deploy guide, API, QA test table, ERD, design files
├── docker-compose.yml  Database + API + website on one machine
├── render.yaml         Staging and production services on Render
└── .github/workflows/  CI on every pull request, production deploy on a release tag
```

## Run it locally (about 10 minutes)

You need **Git** and **Docker Desktop** (or Docker Engine with Compose v2). Nothing else: Java, Node and PostgreSQL run inside containers.

```bash
git clone https://github.com/aliwer-qanadil/studymate.git
cd studymate
docker compose up --build        # first build takes 3–6 minutes
```

When the log shows the three services as healthy, open **http://localhost:3000**.

**Signing in without an email account.** With no email settings the app prints login codes in the backend log instead of sending them. Enter any 9-digit student ID (for example `250118123`), click *Send me a code*, then in a second terminal:

```bash
docker compose logs backend | grep "Login code"
```

Type the 6-digit code into the page. Sign in with a second student ID in a private window to try the applicant side. Demo students and groups are loaded on the first start.

| What | Address |
| --- | --- |
| Website | http://localhost:3000 |
| API | http://localhost:8080/api (health: `/api/health`) |
| Database | `localhost:5434`, database, user and password `studymate` |

Stop with `Ctrl+C` or `docker compose down`. The data stays in a Docker volume; `docker compose down -v` deletes it. If a port is taken, set `FRONTEND_PORT`, `BACKEND_PORT` or `DB_PORT` in a `.env` file (copy [`.env.example`](.env.example)).

**To send real emails**, copy `.env.example` to `.env` and set `MAIL_USERNAME` and `MAIL_PASSWORD` (for Gmail: your address and an [app password](https://myaccount.google.com/apppasswords)), then `docker compose up -d`.

<details>
<summary>Running without Docker (for development)</summary>

Needs Java 21, Maven, Node 22+ and PostgreSQL 17 (or just the database from Compose: `docker compose up -d db`).

```bash
# Terminal 1: API on http://localhost:8080 (uses the Compose database on port 5434)
cd backend
DB_PORT=5434 mvn spring-boot:run

# Terminal 2: website on http://localhost:5173, forwards /api to port 8080
cd frontend
npm install
npm run dev
```
</details>

## Environment variables

Locally, set them in `.env` (git-ignored; template: [`.env.example`](.env.example)). On Render, set them per service and per environment. Never commit real values.

| Variable | Used by | Required | Default | Purpose |
| --- | --- | --- | --- | --- |
| `DATABASE_URL` | API | In the cloud | – | `postgres://user:password@host:5432/db?sslmode=require`, as Neon or Render give it |
| `SPRING_DATASOURCE_URL`, `_USERNAME`, `_PASSWORD` | API | – | – | JDBC alternative to `DATABASE_URL` (Docker Compose uses these) |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | API, Compose | – | `localhost`, `5432`, `studymate`, `studymate`, `studymate` | Separate parts, used when no URL is given |
| `MAIL_PROVIDER` | API | – | `auto` | `smtp`, `brevo`, `log` (print codes to the log; local only), or `auto` (= `smtp` if `MAIL_USERNAME` is set, else `log`) |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | API | For `smtp` | – | SMTP login. `GMAIL_USER` / `GMAIL_APP_PASSWORD` also work |
| `MAIL_HOST`, `MAIL_PORT` | API | – | `smtp.gmail.com`, `587` | SMTP server |
| `MAIL_FROM` | API | For `brevo` | `MAIL_USERNAME` | Sender address (verified in Brevo) |
| `BREVO_API_KEY` | API | For `brevo` | – | Brevo API key |
| `STUDYMATE_DEMO_DATA_ENABLED` (`DEMO_DATA` in Compose) | API | – | `false` (`true` in Compose) | Load demo students and groups into an empty database |
| `APP_TIME_ZONE` | API | – | `Asia/Almaty` | Time zone for "today" and "already started" checks |
| `CORS_ALLOWED_ORIGINS` | API | – | `http://localhost:5173,http://localhost:3000` | Sites allowed to call the API directly from a browser |
| `PORT` | API, website | Set by the host | `8080` / `80` | Port to listen on |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | API | – | `update` | Schema handling (`update` adds tables and columns, never drops data) |
| `DB_POOL_SIZE` | API | – | `5` | Database connections; free plans allow few |
| `BACKEND_URL` | Website | – | `http://backend:8080` | Where nginx forwards `/api` |
| `FRONTEND_PORT`, `BACKEND_PORT`, `DB_PORT` | Compose | – | `3000`, `8080`, `5434` | Ports on your computer |

## Running the tests

```bash
# Backend: 20 tests (API flows for sign-in, applying and organizer decisions, plus unit tests).
# Needs PostgreSQL; the Compose database works:
docker compose up -d db
cd backend && SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5434/studymate mvn test

# Frontend: code check and production build
cd frontend && npm ci && npm run lint && npm run build
```

GitHub Actions runs both, plus a full `docker compose up` with health checks, on every pull request ([`.github/workflows`](.github/workflows/README.md)). The manual test table with results is in [`docs/qa/test-cases.md`](docs/qa/test-cases.md).

## Deployment

Two environments on Render, each with its own Neon database and its own secrets:

| | Staging | Production |
| --- | --- | --- |
| Website | https://studymate-staging.onrender.com | https://studymate-edrp.onrender.com |
| Deploys | By itself after every merge into `main`, once CI passes | Only when a release tag `v*` is pushed and the tests pass |
| Data | Separate test database with demo data | Separate real database, no demo data |

Setting it up from zero (accounts, Blueprint, secrets) and rolling back: [`docs/DEPLOY.md`](docs/DEPLOY.md). The free plan sleeps after 15 minutes without visitors, so the first page load after a pause takes up to a minute.

## Documentation

| Document | What it is |
| --- | --- |
| [`docs/SRS.md`](docs/SRS.md) | Requirements, user stories with their current status, non-functional requirements |
| [`docs/qa/test-cases.md`](docs/qa/test-cases.md) | Manual test table and results of each run |
| [`docs/DEPLOY.md`](docs/DEPLOY.md) | Deploy, configure and roll back staging and production; problems found after deploying |
| [`docs/API.md`](docs/API.md) | Every API endpoint with examples |
| [`docs/RELEASE_NOTES.md`](docs/RELEASE_NOTES.md) | What each release contains and its known limitations |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Branches, commits, pull requests, reviews and the code freeze |
| [`docs/erd/`](docs/erd/) | Database: current schema and the Milestone 1 design |
| [`docs/figma/`](docs/figma/) | Wireframes; [Figma prototype](https://www.figma.com/proto/zmbupAy7b2AJs3NMX6D8fg/StudyMate?node-id=4-320&starting-point-node-id=4-320) |
| [`docs/Team_Charter.md`](docs/Team_Charter.md) | Team roles and working rules |
| [Trello board](https://trello.com/b/zpM0aGVU/studymate-user-stories) | User stories and tasks |

## Team

| Member | Role |
| --- | --- |
| Arlan Akylbekov | Product Manager: coordination, SRS, Trello |
| Alisher Kanadil | Frontend Developer: React pages, API integration |
| Yelnar Mamirkhanov | Backend Developer: API, database, business rules |
| Agabek Segizbay | Backend Support and QA owner: validation, test runs |
| Bakdaulet Sultanbekov | Designer: user flows, wireframes, Figma |

Contact: `<student ID>@sdu.edu.kz` — see the [Team Charter](docs/Team_Charter.md).
