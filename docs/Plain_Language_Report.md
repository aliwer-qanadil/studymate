# StudyMate: What We Built and What Changed

*A plain-language report for readers new to the project. Date: 20 November 2026.*

---

## 1. What StudyMate is

StudyMate is a website that helps university students find classmates to study with. A student creates a study session, chooses the subject, time and place, and other students send requests to join. The person who created the session chooses who to accept. The site also suggests how well each applicant matches the session, but the final decision always belongs to the organizer.

The project is built by a five-person student team from SDU University as part of the SOE 205 course.

## 2. How the project is organized

Think of the project as a shared folder with three parts:

- **The website (frontend).** The part students see and click on. It is written in React, a common tool for building websites.
- **The server (backend).** The part that stores information, checks passwords and codes, and decides who may do what. It is written in Java with the Spring Boot framework.
- **The database.** A storage system (PostgreSQL) where all students, sessions and requests are saved.

Documents, such as the requirements, database design and presentations, are in a separate `docs` folder.

The project lives on GitHub, an online service where teams keep their shared code and track changes. Each saved change is called a *commit*. A *branch* is a separate line of work. The main branch was used for documents, the frontend and backend each had their own branch, and the complete version that runs everything together is on the branch called `full-stack-docker`.

## 3. What the team had built before this review

- A working website with pages for signing in, browsing study sessions, creating one, viewing applicants, managing requests and editing a profile.
- A working server with the rules for sessions, requests, acceptance and the compatibility score.
- A setup that starts the database, server and website together with one command, using Docker. Docker is a tool that packages each part of an app so it runs the same way on any computer.
- Documents: the requirements specification, the database design, user stories and presentation materials.

## 4. What we checked and what was missing

We compared the project with the week's requirements, which cover quality testing, online deployment, documentation, and a final review before release. We found the following gaps.

**A secret password was saved in the shared code.** The database password was written directly into a settings file. Anyone who can see the project history can read it. This is the most urgent issue.

**No automatic checks.** Nothing ran automatically to check whether the code still works after a change. The tests that existed did not run during the build.

**Not ready for a public server.** The settings assumed everything runs on one developer's laptop. For example, the server did not know it sits behind a secure connection, and demo data was always loaded.

**Documentation was out of date.** The main page still said the server was only planned. The list of website pages was incomplete, and the setup instructions did not cover the server.

**The requirements document did not match the build.** The sign-in method in the build is an emailed one-time code, but the design documents described a password.

## 5. What we fixed

All of the fixes below are saved on a new line of work called `fix/beta-readiness`. They have not replaced the main version yet. The team reviews them first.

1. **Removed the password from the shared code.** The database settings now come from the environment, which is a private configuration kept outside the shared code. Local runs still use a default value that is only for development.
2. **Made the server work behind a secure connection.** It now trusts the address information that the public-facing part of the system passes along, so login requests are not rejected.
3. **Made demo data optional.** Sample students and sessions are loaded only when a setting turns them on. The local Docker setup still turns them on, so the first run looks populated.
4. **Added automatic health checks and restart.** The system now checks that each part is running and restarts it if it stops.
5. **Made the server run with limited permissions.** Inside its container, the server no longer runs as an administrator account, which limits the damage if it is ever compromised.
6. **Added automatic checks on every change.** Each time code is saved to GitHub, a set of checks runs: the website's code checker, a production build of the website, the server tests against a real database, and a Docker build. A red mark means something needs attention.
7. **Updated the documentation.** The main page and the website page list now match the current build, and there are setup instructions for running the server without Docker.
8. **Added notes on the current build to the requirements document.** These notes describe how sign-in and the compatibility score work today. They are a draft for the team to approve. The original requirements were not changed.

## 6. What still needs action from people

Some tasks cannot be finished from code alone:

- **Change the database password.** The old password is still visible in the project history, even though it is gone from the current files. The password should be changed on any computer or server that used it. Removing the history entirely is possible, but it rewrites the project history and should only be done by the team's administrator.
- **Review and merge the fix.** The fix is open as a draft request on GitHub (pull request #3). A team member should look at it, and the checks should pass before it is merged.
- **Confirm the requirements.** The team should decide whether the sign-in method in the requirements should change to match the build, or whether the build should change to match the requirements.
- **Add screenshots.** The setup guide asks for screenshots, which need the app running on a computer with Docker. They have not been added yet.
- **Deploy to a public server.** The project is ready to be placed on a cloud service, but no hosting account or address has been chosen yet.
- **Check the open issues list.** Problems should be recorded as GitHub Issues so the team can track them. This session could not read the issues list, so the team should confirm what is already recorded.

## 7. Limits of this review

- The server's code was not compiled in this review. Its online package library was not reachable from the working environment, so the automatic checks on the pull request are the first full test of these changes.
- The website's checks passed: the code checker reported no problems, and the production build completed.
- The requirements in the earlier items of the team's week plan were not visible to this review, so only the items listed in the screenshot were checked.

## 8. How to run the project

1. Install Docker Desktop.
2. Download the project from GitHub on the branch `full-stack-docker`.
3. Copy `.env.example` to `.env` and fill in the email settings, if you want real login codes.
4. Run `docker compose up --build`.
5. Open http://localhost:3000 in a browser.

## 9. Glossary

- **Branch:** a separate line of work in a project, so changes can be reviewed before joining the main version.
- **Commit:** one saved change, with a note explaining what changed.
- **Pull request:** a request to add a branch's changes to another branch, which the team reviews first.
- **Continuous integration (CI):** an automatic check that runs every time code changes.
- **Docker:** a tool that runs each part of the app in an isolated package.
- **Environment variable:** a setting stored outside the code, such as a password, so it is not shared publicly.
- **Database:** the storage system where all information is kept.
