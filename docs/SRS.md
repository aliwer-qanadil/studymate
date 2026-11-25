# StudyMate — Software Requirements Specification (SRS)

**Course:** SOE 205 Capstone Project  
**Stage:** Week 3 requirements, updated for the v0.9-beta release (25 November 2026). Sections 1–6 are the agreed requirements; section 7 records the product as built.  
**Team:** Arlan Akylbekov (PM), Yelnar Mamirkhanov (backend), Agabek Segizbay (backend support), Bakdaulet Sultanbekov (design), Alisher Kanadil (frontend)

## 1. Introduction

StudyMate helps students arrange in-person study sessions. A student creates a group with a subject, place, and time. Other students browse groups, answer a short joining questionnaire, and request to join. The organizer sees each applicant's compatibility score and accepts or rejects the request.

**Scope for this SRS:** registration and sign-in, preferences, finding and creating groups, join requests, organizer decisions, and a transparent compatibility score. Chat, shared materials, ratings, and automated notifications are outside the current Must-have scope. The score is calculated from the applicant's answers when a join request is submitted; a score on the public group list is not required.

## 2. User Roles

| Role | Main actions |
| --- | --- |
| Guest | Register, sign in, and browse public groups. |
| Registered student | Set preferences, browse groups, send join requests, and check request status. |
| Group organizer | A registered student who creates a group and reviews requests to that group. |

## 3. Functional Requirements

### Epic A — Account and preferences

**US-01 — Register (Must).** As a guest, I want to create an account so that I can request to join study groups.  
- Given I am on the registration page, when I submit valid required details, then my account is created and I can continue into the app.
- Given a required field is missing or the email is already in use, when I submit the form, then the account is not created and I see a field-level error.

**US-02 — Sign in (Must).** As a returning student, I want to sign in so that I can use my account and manage requests.  
- Given I have an account, when I submit valid credentials, then I enter my account.
- Given my credentials are invalid, when I submit them, then access is denied with a clear error.

**US-03 — Save study preferences (Should).** As a registered student, I want to save my subjects, knowledge levels, available times, and optional study preferences so that I can reuse them when joining groups.  
- Given I am editing my preferences, when I save a subject with its level and available time, then those values are available the next time I open my profile.
- Given a selected subject lacks a knowledge level, when I save, then the missing field is identified and the incomplete entry is not saved.

**US-04 — Edit study preferences (Could).** As a registered student, I want to change my saved preferences so that future applications reflect my current schedule and interests.  
- Given I have saved preferences, when I change and save them, then my profile shows the new values.

### Epic B — Discover and create groups

**US-05 — Create a study group (Must).** As a registered student, I want to publish a study group with a subject, place, and future meeting time so that others can request to join.  
- Given I am signed in, when I submit all required group details with a future time, then the group appears in the group list and I become its organizer.
- Given the meeting time is in the past, when I try to publish, then the group is not created and the time field shows an error.

**US-06 — Browse available groups (Must).** As a guest or registered student, I want to see upcoming study groups so that I can find a suitable meeting.  
- Given upcoming groups exist, when I open the group list, then I see each group's subject, place, and time.
- Given no upcoming groups exist, when I open the list, then I see an empty-state message.

**US-07 — Filter by subject (Should).** As a student, I want to filter groups by subject so that I see relevant sessions.  
- Given groups in multiple subjects are listed, when I select one subject, then only groups with that subject remain visible.
- Given a subject filter is active, when I clear it, then the unfiltered list returns.

**US-08 — Filter by time (Should).** As a student, I want to filter groups by meeting time so that I can find sessions I can attend.  
- Given groups meet at different times, when I choose a time range, then the list shows only meetings within that range.

**US-09 — View group details (Must).** As a student, I want to open a group to see its subject, place, time, and organizer so that I can decide whether to apply.  
- Given I am viewing the group list, when I open a group, then its complete required meeting details are displayed.

### Epic C — Join requests and organizer decisions

**US-10 — Answer joining questions (Must).** As a registered student, I want to enter my subject, available time, knowledge level, and optional preferences for a group so that my application contains the information needed for matching.  
- Given I open a group's application form, when I leave required answers empty and try to continue, then those fields show errors and submission is blocked.
- Given I have saved profile preferences, when I open the form, then I can review and change any prefilled answers before submitting.

**US-11 — Submit a join request (Must).** As a registered student, I want to send my completed application to a group organizer so that they can decide whether I can join.  
- Given I completed the required answers for someone else's group, when I submit, then one request is saved with status Pending and I see confirmation.
- Given I already have a Pending request for this group, when I try to submit again, then a duplicate request is not created.

**US-12 — Check request status (Should).** As an applicant, I want to see whether my request is Pending, Accepted, or Rejected so that I know the outcome.  
- Given I submitted a request, when I open my requests, then I see its current status.

**US-13 — View incoming requests (Must).** As a group organizer, I want to see applications for my group so that I can review candidates.  
- Given my group has Pending requests, when I open its requests, then I see each candidate's answers and compatibility score.
- Given I do not organize a group, when I try to access its private requests, then access is denied.

**US-14 — Accept a request (Must).** As a group organizer, I want to accept a Pending applicant so that they become a member of my group.  
- Given a request to my group is Pending, when I accept it, then its status becomes Accepted and the applicant appears among the group's members.
- Given a request is already decided, when I try to accept it again, then no second membership is created.

**US-15 — Reject a request (Must).** As a group organizer, I want to reject a Pending applicant so that the request receives a clear decision.  
- Given a request to my group is Pending, when I reject it, then its status becomes Rejected and the applicant is not added to the group.

### Epic D — Compatibility

**US-16 — Applicant sees own score (Should).** As an applicant, I want to see my compatibility score after applying so that I understand how closely my answers match the group.  
- Given I submitted a complete application, when I view its details, then I see a score from 0 to 100 percent.

**US-17 — Organizer sees applicant score (Must).** As a group organizer, I want to see each applicant's compatibility score so that I can compare applications.  
- Given a student submits a complete application, when I view that request, then I see the score calculated from its saved answers.
- Given subject and time match but level and optional preferences do not, when the score is calculated, then it equals 70 percent under the current weighting.

**US-18 — Explain score (Should).** As a student or organizer viewing an application, I want to see the score breakdown so that I understand the result.  
- Given I can see a score, when I open its explanation, then I see the contribution of subject, time, level, and optional preferences.

**Matching rule for the current draft:** subject match contributes 40 points; compatible meeting time contributes 30; equal knowledge level contributes 20; matching optional study preferences contribute 10. Otherwise each component contributes zero, and omitted optional preferences contribute zero. The score is an aid to organizer decisions, not automatic acceptance. The team should confirm the precise definitions of time overlap, level comparison, and optional preference match before implementation.

**INVEST review:** The original combined drafts mixed account setup, group creation, filtering, scoring, and API implementation. They were split by user outcome: for example, creating a group is separate from browsing, filtering by subject from filtering by time, and answering questions from submitting a request. Each numbered story has one observable outcome and acceptance criteria; details of API routes and internal transactions belong in design or implementation tasks.

## 4. Non-Functional Requirements

The targets below are acceptance goals to test, not claims about the current implementation.

| ID | Category | Measurable requirement and check |
| --- | --- | --- |
| NFR-01 | Performance | With 100 concurrent users and 1,000 upcoming groups in a test dataset, 95% of group-list requests return within 2 seconds, measured in a repeatable load test. |
| NFR-02 | Security | Only a signed-in student may create groups or submit requests; only a group's organizer may view and decide its incoming requests. Test unauthorized and cross-group access attempts. |
| NFR-03 | Security | Passwords are stored using an adaptive salted password hash; a database inspection must contain no plaintext passwords. |
| NFR-04 | Usability | In a test with at least five new students, at least four can find a group and submit a valid application within two minutes without help. |
| NFR-05 | Accessibility | Core registration, browsing, application, and organizer actions work by keyboard; text contrast is at least 4.5:1 for normal text, and score meaning is not conveyed by color alone. |
| NFR-06 | Responsive design | At viewport widths 360 px, 768 px, and 1280 px, core pages remain usable without horizontal page overflow. |
| NFR-07 | Data integrity | Repeating a join submission or organizer decision must not create duplicate Pending requests or duplicate membership. Verify with repeated and concurrent requests. |

## 5. Constraints and assumptions

- Planned stack from the project documentation: React, Vite, Tailwind CSS, Spring Boot, and PostgreSQL. These are project choices, not evidence that the features are already built.
- The meeting time and location are entered by the organizer. Group capacity and automatic expiry are not required for this Week 3 Must-have set.
- Restricting registration to `@sdu.edu.kz`, a particular token format, notification delivery, and specific HTTP routes or status codes require a separate team decision. They are not implicit requirements here.
- Exact definitions for compatibility comparisons and whether guests may view full group details should be agreed by the team before coding.

## 6. Prioritization (MoSCoW)

| Priority | Stories | Total | Kanban action |
| --- | --- | ---: | --- |
| Must-have | US-01, US-02, US-05, US-06, US-09, US-10, US-11, US-13, US-14, US-15, US-17 | 11 | Create corresponding cards in Backlog or To Do. |
| Should-have | US-03, US-07, US-08, US-12, US-16, US-18 | 6 | Keep in SRS; add cards later if the team plans them. |
| Could-have | US-04 | 1 | Keep in SRS; plan if time allows. |
| Won't-have this iteration | None of the numbered stories | 0 | Chat, ratings, and automated notifications are outside this SRS scope. |

**Kanban convention:** Use the same US identifiers and titles in the board and this document. Backlog means agreed and unscheduled; To Do means selected for the next work period; In Progress, In Review, and Done reflect actual work. A written story or criterion is not evidence that the feature is implemented.

---

## 7. Product as built (v0.9-beta, 25 November 2026)

### 7.1 Story status

**Done** = the acceptance criteria above pass in the build. **Partial** = part is missing. **Deferred** = not in this release. Evidence: the manual test table [`qa/test-cases.md`](qa/test-cases.md) (run 2) and the automated API tests in `backend/src/test`.

| Story | Priority | Status | Reason |
| --- | --- | --- | --- |
| US-01 Register | Must | Done | Passwordless by design: the first sign-in with a code emailed to `<studentId>@sdu.edu.kz` creates the account. Empty or badly formatted IDs get a field error (TC-01–03). |
| US-02 Sign in | Must | Done | One-time 6-digit code, valid 10 minutes, 5 wrong tries; wrong, expired and badly formatted codes are refused with a clear message (TC-04–07). |
| US-03 Save preferences | Should | Done | Subjects with levels, usual free time, study style and favourite places are saved on the profile; a subject can't be saved without a level. |
| US-04 Edit preferences | Could | Done | All of them can be changed on the profile; changes are used by the next application. |
| US-05 Create group | Must | Done | Groups in the past, or today at a time that has started, are refused; each invalid field is marked (TC-09–12, #9). |
| US-06 Browse groups | Must | Done | Open upcoming groups with subject, place and time; empty state; finished meetings are hidden (TC-13–14, #21). |
| US-07 Filter by subject | Should | Done | Subject, place and search filters; "Matches me first" puts groups in the student's subjects on top. |
| US-08 Filter by time | Should | Done | Part of day (morning, afternoon, evening) and date range (today, next 7 days, all). |
| US-09 View group details | Must | Done | Subject, place, time, organizer, members; the exact spot only after acceptance (TC-15–16). |
| US-10 Answer joining questions | Must | Done | Application form with course, level, free time, preferences and note; prefilled from the profile and editable; empty required fields are marked (TC-17–18, #7). |
| US-11 Submit join request | Must | Done | One Pending request, confirmation with the score; duplicates refused by the service and by a database index (TC-19–22, #22). |
| US-12 Check request status | Should | Done | "Requested" page with Waiting / You're in / Not accepted; a pending request can be cancelled. |
| US-13 View incoming requests | Must | Done | Answers, note and score per applicant; anyone but the organizer gets 403 and is sent to the public group page (TC-23–24, #10). |
| US-14 Accept request | Must | Done | Applicant becomes a member; a second accept is refused; the group closes when full (TC-25–26, TC-30). |
| US-15 Reject request | Must | Done | Status Rejected, not added; decided requests can't be changed (TC-27–28). |
| US-16 Applicant sees own score | Should | Done | Shown on confirmation, on the Requested page and on the group page. |
| US-17 Organizer sees score | Must | Done | Same course and time, two levels apart, no shared preference gives exactly 70 % (TC-29). |
| US-18 Explain score | Should | Done | Breakdown of subject, time, level and preferences for every applicant. |

All 18 stories are Done; none are Deferred.

### 7.2 Decisions taken during the build

These close the open questions in section 5.

- **Registration** is limited to SDU students by emailing the code to `<studentId>@sdu.edu.kz`; there are no passwords (NFR-03 is met by not storing any: codes are BCrypt-hashed and session tokens SHA-256-hashed).
- **Score definitions:** subject 100 for the same course code, 50 for the same department prefix; time = share of the meeting inside the applicant's free window; level 100 / 50 / 0 for 0 / 1 / 2 levels apart, or 100 if the group allows any level; preferences = share of the group's preferences the applicant shares (100 if the group has none). Weights 40 / 30 / 20 / 10. Details in [`API.md`](API.md#compatibility-score).
- **Guests** can browse the list but must sign in to open group details or apply.
- **Group size** (2–10 including the organizer) was added; a full group stops taking requests.
- **Routes and status codes** are documented in [`API.md`](API.md).

### 7.3 Non-functional requirements

| ID | Status | Evidence or reason |
| --- | --- | --- |
| NFR-01 Performance | Not measured | No load test has been run. The list query uses an index on status and date, and the beta's data is far below 1,000 groups. A k6 load test against staging is planned after the beta. |
| NFR-02 Security | Met | Every `/api/users/{id}/...` call needs that user's session token (401 / 403 otherwise); only the organizer can list or decide requests. Automated tests: `AuthInterceptorTests`, `CriticalFlowTests`. |
| NFR-03 Security | Met (no passwords) | No passwords exist. Login codes are BCrypt-hashed, session tokens stored as SHA-256 hashes, at most 10 codes per network address per 15 minutes. |
| NFR-04 Usability | Not yet tested | Needs the five-student test with new users; planned as the Week 13 usability test on production. |
| NFR-05 Accessibility | Partly met | Forms have labels, field errors are announced (`role="alert"`), toggles report their state, all controls are native buttons, links and form fields so they work by keyboard, and Escape closes the application dialog; scores are shown as numbers, not only colours. Contrast has not been measured with a tool. |
| NFR-06 Responsive design | Met | No sideways scrolling on any page at 360, 768 and 1280 px (#18, screenshots in `qa/screenshots/`). |
| NFR-07 Data integrity | Met | Repeated submissions and decisions are refused (TC-20, TC-26, TC-28); a partial unique index stops simultaneous duplicates and an optimistic lock stops two accepts taking the last seat (#22). |

### 7.4 Architecture

React (Vite, Tailwind) is built into static files served by nginx, which forwards `/api` to the Spring Boot API; the API stores data in PostgreSQL and sends login codes by SMTP or the Brevo API. Locally all three run with Docker Compose; staging and production run on Render with Neon databases ([`DEPLOY.md`](DEPLOY.md)). The database as built, and how it differs from the Milestone 1 ERD, is in [`erd/Current_Schema.md`](erd/Current_Schema.md).
