# StudyMate

**StudyMate** is a web application that helps university students find people for group study.

A student can create a study meeting, choose a subject, time, and place, and receive applications from other students.

This project is being developed by the **Study Devs** team as part of the **SOE 205** course.

---

## Repository Layout

The repository uses three long-lived branches:

| Branch     | Contents                                       |
| ---------- | ---------------------------------------------- |
| `main`     | Project documentation only                     |
| `frontend` | React + Vite web application                   |
| `backend`  | README only; Spring Boot server planned         |

Each branch contains only its own files: documentation is kept only on `main`.

### Working on all three branches locally

You can check out every branch into its own folder with `git worktree`:

```bash
mkdir studymate && cd studymate
git clone --bare https://github.com/aliwer-qanadil/studymate.git .bare
echo "gitdir: ./.bare" > .git
git config remote.origin.fetch "+refs/heads/*:refs/remotes/origin/*"
git fetch origin
for b in main frontend backend; do git branch -u origin/$b $b; done
git worktree add docs main
git worktree add frontend frontend
git worktree add backend backend
```

This gives you:

```
studymate/
├── docs/       ← main branch
├── frontend/   ← frontend branch
└── backend/    ← backend branch
```

Inside each folder, `git commit` and `git push` only affect that folder's branch.

---

## Project Idea

Students often understand difficult topics better when they study together. However, finding classmates who study the same subject, have a suitable schedule, and have a similar knowledge level can take a lot of time.

**StudyMate** helps students organize this process in one place.

---

## How It Works

1. A student creates an account and completes a profile.
2. The organizer creates a study group.
3. Other students browse available groups.
4. A student answers a few questions and sends a join request.
5. StudyMate calculates a compatibility score.
6. The organizer accepts or rejects the request.
7. The applicant can see the current request status.

---

## Main Features

* User registration and sign in
* Student profile and study preferences
* Study group creation
* Group search and filtering
* Detailed group information
* Join requests
* Compatibility score
* Compatibility score breakdown
* Accept or reject actions for organizers
* Application status tracking
* Form validation and clear error messages

---

## Compatibility Score

The compatibility score is calculated using four factors:

| Factor                     | Weight |
| -------------------------- | -----: |
| Same subject               |    40% |
| Suitable meeting time      |    30% |
| Matching knowledge level   |    20% |
| Matching study preferences |    10% |

The score helps the organizer compare applicants.

> The compatibility score does **not** automatically accept or reject anyone. The final decision is made by the study group organizer.

---

## Technology Stack

### Frontend

* React
* Vite
* Tailwind CSS

### Backend (planned)

* Spring Boot
* PostgreSQL
* Spring Security
* JWT Authentication

### Other Tools

* Figma
* Postman
* GitHub
* Trello

---

## Team

| Team Member           | Role                      | Email                                               |
| --------------------- | ------------------------- | --------------------------------------------------- |
| Yelnar Mamirkhanov    | Backend Developer         | [250118010@sdu.edu.kz](mailto:250118010@sdu.edu.kz) |
| Agabek Segizbay       | Backend Support and QA owner | [250118006@sdu.edu.kz](mailto:250118006@sdu.edu.kz) |
| Bakdaulet Sultanbekov | Designer                  | [250118015@sdu.edu.kz](mailto:250118015@sdu.edu.kz) |
| Alisher Kanadil       | Frontend Developer        | [250118021@sdu.edu.kz](mailto:250118021@sdu.edu.kz) |
| Arlan Akylbekov       | Product Manager           | [250118016@sdu.edu.kz](mailto:250118016@sdu.edu.kz) |

---

## Project Documentation

All documentation lives in the `docs/` folder on the `main` branch:

| Deliverable                                       | Location                                     |
| ------------------------------------------------- | -------------------------------------------- |
| Software Requirements Specification (SRS)         | [`docs/SRS.md`](docs/SRS.md)                 |
| User stories, acceptance criteria, priorities     | [`docs/SRS.md`](docs/SRS.md)                 |
| Project documentation                             | `docs/StudyMate_Project_Documentation.docx`  |
| Entity-relationship diagram (ERD)                 | [`docs/erd/`](docs/erd/)                     |
| Figma designs and exports                         | [`docs/figma/`](docs/figma/)                 |

The source code is not on `main`: the web app is on the `frontend` branch and the `backend` branch currently contains a README and no server implementation.

---

## Trello Board

We use one shared Trello board to manage the whole project.

[StudyMate user stories board](https://trello.com/b/zpM0aGVU/studymate-user-stories)

### Board Columns

* **Backlog**
* **To Do**
* **In Progress**
* **In Review**
* **Done**

---

## Running the Frontend

### 1. Clone the Repository

```bash
git clone https://github.com/aliwer-qanadil/studymate.git
```

### 2. Open the Project Folder and Switch to the `frontend` Branch

```bash
cd studymate
git checkout frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start the Development Server

```bash
npm run dev
```

After starting the server, open the local URL provided by Vite in your browser.

---

## Current Progress

* **Week 1:** Project idea, team roles, and technology stack completed
* **Week 2:** GitHub repository and Trello board created
* **Week 3:** SRS, user stories, acceptance criteria, and priorities prepared
* Development of the first working version is currently in progress

---

## Current Scope

The first version of StudyMate focuses on the main user flow:

1. Create a student profile
2. Create or find a study group
3. Send a join request
4. Calculate compatibility
5. Accept or reject the request
6. View the application status

The goal of the first version is to provide a simple and functional system for connecting students who want to study together.

---

## Future Features

The following features are **not part of the current version** but may be added in the future:

* Chat between students
* Student ratings
* Shared files
* Advanced notifications
* Monetization features

---

## Repository

GitHub Repository:

https://github.com/aliwer-qanadil/studymate


## Milestone 1 design package

- [Standalone Team Charter](docs/Team_Charter.md), [Word copy](docs/Team_Charter.docx)
- [Editable ERD](docs/erd/StudyMate_ERD.drawio), [core render](docs/erd/ERD_Core.svg), [profile render](docs/erd/ERD_Profile.svg)
- [Database design and open decisions](docs/erd/Database_Design.md)
- [Proposed PostgreSQL DDL](docs/erd/schema.sql)
- [UI → ERD traceability](docs/Traceability.md)
- [Wireframes and native Figma setup](docs/figma/FIGMA_SETUP_RU.md)
- [Defense slides](docs/defense/StudyMate_Milestone1.pptx), [speaker notes](docs/defense/StudyMate_Speaker_Notes.pdf), [Q&A](docs/defense/StudyMate_QA.pdf)
- [Dated process evidence and remaining actions](docs/Process_Evidence.md)

The Team Charter is approved by Arlan Akylbekov as PM on 9 October 2026; individual team acknowledgements remain pending. The schema and wireframes are proposed designs based on the SRS, prepared with AI assistance for team review. The [native Figma prototype](https://www.figma.com/proto/zmbupAy7b2AJs3NMX6D8fg/StudyMate?node-id=4-320&starting-point-node-id=4-320) now contains 20 editable screens and 126 transitions. Instructor view access and a browser walkthrough still need verification. See [native prototype links](docs/figma/NATIVE_FIGMA_LINKS.md). The local HTML is a rehearsal backup. These files do not prove implemented authentication, a working backend, or merged PRs from all five members.
