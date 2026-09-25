StudyMate
StudyMate is a web application that helps university students find people for group study. A
student can create a study meeting, choose a subject, time and place, and receive
applications from other students.
This project is being developed by the Study Devs team as part of the SOE 205 course.
Project Idea
Students often understand difficult topics better when they study together. However, finding
classmates with the same subject, suitable schedule and similar knowledge level can take a
lot of time.
StudyMate helps students organize this process in one place.
How It Works
1. A student creates an account and completes a profile.
2. The organizer creates a study group.
3. Other students browse available groups.
4. A student answers a few questions and sends a join request.
5. StudyMate calculates a compatibility score.
6. The organizer accepts or rejects the request.
7. The applicant can see the current request status.
Main Features
●
●
●
●
●
●
●
●
●
●
●
User registration and sign in
Student profile and study preferences
Study group creation
Group search and filtering
Detailed group information
Join requests
Compatibility score
Compatibility score breakdown
Accept or reject actions for organizers
Application status tracking
Form validation and clear error messages
Compatibility Score
The compatibility score is calculated using four factors:
Factor Weight
Same subject 40%
Suitable meeting time 30%
Matching knowledge level 20%
Matching study
preferences
10%
The score helps the organizer compare applicants. It does not automatically accept or reject
anyone.
Technology Stack
Frontend
●
●
●
React
Vite
Tailwind CSS
Backend
●
●
●
●
Spring Boot
PostgreSQL
Spring Security
JWT authentication
Other Tools
●
●
●
●
Figma
Postman
GitHub
Trello
Team
Team Member Role Email
Yelnar Mamirkhanov Backend Developer 250118010@sdu.edu.k
z
Agabek Segizbay Backend Developer
Support
250118006@sdu.edu.k
z
Bakdaulet Sultanbekov Designer 250118015@sdu.edu.k
z
Alisher Kanadil Frontend Developer 250118021@sdu.edu.k
z
Arlan Akylbekov Product Manager 250118016@sdu.edu.k
z
Project Documentation
●
●
Software Requirements Specification
Project Documentation
Trello Board
We use one shared Trello board for the whole project.
Board columns:
●
●
●
●
●
Backlog
To Do
In Progress
In Review
Done
Trello Board
Running the Frontend
Clone the repository:
git clone https://github.com/aliwer-qanadil/studymate.git
cd studymate
Install the dependencies:
npm install
Start the development server:
npm run dev
Current Progress
●
●
●
●
Week 1: project idea, team roles and technology stack completed
Week 2: GitHub repository and Trello board created
Week 3: SRS, user stories, acceptance criteria and priorities prepared
Development of the first working version is in progress
Current Scope
The first version focuses on the main user flow: creating a profile, creating or finding a study
group, sending a request and receiving a decision.
Chat, ratings, shared files, advanced notifications and monetization are planned only as
possible future features.