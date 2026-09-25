# StudyMate

**StudyMate** is a web application that helps university students find people for group study.

A student can create a study meeting, choose a subject, time, and place, and receive applications from other students.

This project is being developed by the **Study Devs** team as part of the **SOE 205** course.

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

### Backend

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
| Agabek Segizbay       | Backend Developer Support | [250118006@sdu.edu.kz](mailto:250118006@sdu.edu.kz) |
| Bakdaulet Sultanbekov | Designer                  | [250118015@sdu.edu.kz](mailto:250118015@sdu.edu.kz) |
| Alisher Kanadil       | Frontend Developer        | [250118021@sdu.edu.kz](mailto:250118021@sdu.edu.kz) |
| Arlan Akylbekov       | Product Manager           | [250118016@sdu.edu.kz](mailto:250118016@sdu.edu.kz) |

---

## Project Documentation

The project documentation includes:

* Software Requirements Specification (SRS)
* Project Documentation
* User Stories
* Acceptance Criteria
* Feature Priorities

---

## Trello Board

We use one shared Trello board to manage the whole project.

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

### 2. Open the Project Folder

```bash
cd studymate
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
