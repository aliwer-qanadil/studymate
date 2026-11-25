# StudyMate manual test cases (Week 10)

Covers every Must-have user story in `docs/SRS.md`: US-01, US-02, US-05, US-06, US-09, US-10, US-11, US-13, US-14, US-15 and US-17. Each story has a normal case and at least one edge case.

Expected results come from the backend validation rules and error messages in the code. A failure becomes a GitHub Issue titled `[Severity] Short description`, labelled with its severity and area.

Test accounts: use two different 9-digit student IDs, call them **Student A** (organizer) and **Student B** (applicant). Demo data is off by default in deployments; for a local run set `DEMO_DATA=true` in `.env`.

## Run 1: 2026-11-20, local Docker (before the fixes)

| | |
| --- | --- |
| Build | `full-stack-docker` @ `9952c04` (PR #3 merged), started from `course/weeks-10-13` |
| Command | `DEMO_DATA=true docker compose up --build` in a fresh database |
| Browser | Chromium (Playwright), 1366×860 |
| Email | Login codes were caught by a local Mailpit SMTP server instead of Gmail, so the full send-code → email → verify flow ran without real inboxes |
| Accounts | Student A = `250118111` (user 6), Student B = `250118112` (user 5); demo users Aliya, Madina and Arman as extra applicants or organizers |
| Screenshots | [`docs/qa/screenshots/`](screenshots/) |

**Two blockers were found before the cases could run:**

1. `docker compose up --build` never starts the frontend because the backend health check always fails (#5). Worked around with `docker compose up -d --no-deps frontend`.
2. Every POST/PUT/PATCH from the browser fails with `403 Invalid CORS request` (#4). TC-01 records that failure. For the rest of the run, the one-line nginx fix from #4 was applied to the running container, so cases marked *(with #4 fix)* would also fail on the unpatched build.

"API" in *Actual* means the step can't be done through the UI, because it only offers valid choices. The request was sent with `curl` to check the backend rule.

| ID | Story | Type | Steps | Expected result | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | US-01 | Normal | Enter a valid 9-digit student ID, request a code, enter the 6-digit code from email. | Signed in; the account exists and the app opens. | "Something went wrong. Try again." `POST /api/auth/send-code` returns 403 Invalid CORS request through nginx. With the #4 fix: code email arrives, sign-in works, account created. | Fail ([#4](https://github.com/aliwer-qanadil/studymate/issues/4)) |
| TC-02 | US-01 | Edge: wrong format | Enter an 8-digit student ID and submit. | Field error: "must be a 9-digit student ID". No code is sent. | "Your SDU email is your 9-digit student ID, e.g. 250118021@sdu.edu.kz". No request sent. | Pass |
| TC-03 | US-01 | Edge: empty field | Leave the student ID empty and submit. | Submission blocked with a field error. | "Enter your student ID." under the field. | Pass |
| TC-04 | US-02 | Normal | Sign in with the correct code from the email. | Access granted. | Redirected to `/browse`, signed in as 250118111 *(with #4 fix)*. | Pass |
| TC-05 | US-02 | Edge: wrong code | Enter a 6-digit code that is not the one sent. | Access denied with a clear error. The user is not signed in. | "Wrong code. Check your email and try again." Stayed on sign-in, no user saved *(with #4 fix)*. | Pass |
| TC-06 | US-02 | Edge: expired code | Wait until the code expires, then enter it. | Access denied; the message says the code is no longer valid. | "This code has expired. Ask for a new one." Expiry was moved into the past in the test DB instead of waiting 10 min *(with #4 fix)*. | Pass |
| TC-07 | US-02 | Edge: wrong format | Enter a 5-digit code or letters in the code field. | Field error: "must be the 6-digit code from your email". | "Enter the 6-digit code from your email." Letters can't be typed (field keeps digits only). | Pass |
| TC-08 | US-02 | Edge: logged-out access | Signed out, open `/groups`, `/requested` and `/profile` directly. | Each page redirects to sign-in, or shows a sign-in prompt. No private data is shown. | All three show a guest note with **Log in**; `/groups/:id` and `/groups/:id/applicants` redirect to sign-in. The API behind them needs no sign-in at all, see #6. | Pass |
| TC-09 | US-05 | Normal | Signed in as Student A: create a group with title, subject, course code, place, a meeting date of tomorrow and a start and end time. | The group appears in the list; Student A is shown as organizer. | Group "QA group A" appears on Browse, Tomorrow 16:00–18:00, organizer 250118111 *(with #4 fix)*. | Pass |
| TC-10 | US-05 | Edge: past date | Set the meeting date to yesterday and submit. | Group not created; the date field shows an error. | UI only offers Today / Tomorrow / Day after. API: 400, `meetingDate: must be a date in the present or in the future`; no group saved. | Pass |
| TC-11 | US-05 | Edge: very long text | Enter a 256-character title and submit. | Rejected with a length error; group not created. | "size must be between 0 and 255" under the form; not created. The message doesn't name the field (#9). | Pass |
| TC-12 | US-05 | Edge: empty required fields | Leave the subject or place empty and submit. | Submission blocked; the empty fields are marked. | Subject and place are pickers and can't be empty. Clearing course code + description: blocked with one generic message, no field marked. API with empty subject/place: 400 with both field errors. | Fail ([#9](https://github.com/aliwer-qanadil/studymate/issues/9)) |
| TC-13 | US-06 | Normal | Open the group list with at least one upcoming group. | Each group shows its subject, place and time. | Every card shows subject, place and day/time. A hard-coded fake "PHYS 121" card is also always shown (#8). | Pass |
| TC-14 | US-06 | Edge: empty state | Apply a filter that matches no group. | Empty-state message is shown; no error. | "No groups match these filters." and "0 groups", but the fake PHYS 121 card still shows below it (#8). | Pass |
| TC-15 | US-09 | Normal | Open a group from the list. | Subject, place, time and organizer are shown. | Calculus II, Library, Tomorrow 16:00–18:00, organizer 250118111 (OWNER). Exact spot hidden until accepted. | Pass |
| TC-16 | US-09 | Edge: unknown group | Open `/groups/999999` in the address bar. | A "not found" message is shown; the app does not crash. | "Study group with id 999999 not found", navbar still works. | Pass |
| TC-17 | US-10 | Edge: required answers empty | Open the application form for Student A's group as Student B, leave required answers empty, try to submit. | Errors on each empty required field; submission blocked. | There is no application form. **Request to join** sends at once with the group's own values. | Fail ([#7](https://github.com/aliwer-qanadil/studymate/issues/7)) |
| TC-18 | US-10 | Normal | Fill in all required answers and submit. | Application is accepted and the confirmation is shown. | No answers can be entered (no form). The request itself is sent and confirmed, see TC-19. | Fail ([#7](https://github.com/aliwer-qanadil/studymate/issues/7)) |
| TC-19 | US-11 | Normal | Student B submits a complete application to Student A's group. | One request is saved with status Pending; confirmation shown. | "Your request is with 250118111. Your match score is 100%." One PENDING request in the DB *(with #4 fix)*. | Pass |
| TC-20 | US-11 | Edge: duplicate | Student B submits a second application to the same group. | Error: "You have already applied to this study group". No second request. | UI hides the button after applying. API: 409 "You have already applied to this study group"; still one request. | Pass |
| TC-21 | US-11 | Edge: own group | Student A applies to a group Student A organizes. | Error: "You cannot apply to your own study group". | UI sends the organizer to the applicants page. API: 409 "You cannot apply to your own study group". | Pass |
| TC-22 | US-11 | Edge: past meeting | Apply to a group whose meeting date has passed. | Error: "This meeting has already taken place". | Group date set to yesterday in the test DB (past groups can't be created). API: 409 "This meeting has already taken place". | Pass |
| TC-23 | US-13 | Normal | Student A opens the applicants page for their group. | Each Pending request shows the candidate's answers and score. | Both applicants shown with level, free time, preferences and score breakdown. Both are 100% because of #7. | Pass |
| TC-24 | US-13 | Edge: not organizer | Student B opens the applicants page for Student A's group by URL. | Access denied; no candidate data shown. | No candidate data, but the page says "Study group with id 4 not found", "No new requests for **your** Calculus II group" and lists B as "You · OWNER". The API returns the data when the organizer's id is put in the URL, see #6. | Fail ([#10](https://github.com/aliwer-qanadil/studymate/issues/10)) |
| TC-25 | US-14 | Normal | Student A accepts a Pending request. | Status becomes Accepted; Student B appears among the members. | B listed under "In your group · 2 of 4" as "Accepted · 100% match"; seats left 3 → 2 *(with #4 fix)*. | Pass |
| TC-26 | US-14 | Edge: accept twice | Accept the same request again (second tab or API call). | Error: "Join request is already accepted". No second membership. | API: 409 "Join request is already accepted"; still one membership. | Pass |
| TC-27 | US-15 | Normal | Student A rejects a Pending request. | Status becomes Rejected; Student B is not added. | Declined Aliya's request: status REJECTED, not added to members *(with #4 fix)*. | Pass |
| TC-28 | US-15 | Edge: decide after decision | Reject a request that is already Accepted. | Error: "Join request is already accepted". Status unchanged. | API: 409 "Join request is already accepted"; status still ACCEPTED. | Pass |
| TC-29 | US-17 | Normal | Student B applies with the same subject and overlapping time, but a different level and no shared preferences. | Score shown as 70% (40 subject + 30 time). | Via API (the UI can't send different answers, #7): Aliya, ADVANCED, applies to ENG 102 (BEGINNER). Organizer sees "70% Good match", breakdown 100/100/0/0. A one-level gap gives 80%; 70% needs a two-level gap. | Pass |
| TC-30 | US-17 | Edge: full group | Apply to a group that already has its maximum number of members. | Error: "Study group is full". | Size-2 group, one applicant accepted → status FULL. Next applicant: 409 "Study group is full". | Pass |
| TC-31 | US-17 | Edge: long note | Enter a note of more than 500 characters in the application. | Rejected with a length error. | No note field in the UI (#7). API: 400 `note: size must be between 0 and 500`; nothing saved. | Pass |

## Run 1 result summary

| Status | Count |
| --- | --- |
| Pass | 26 |
| Fail | 5 |
| Not run | 0 |

## Run 2: 2026-11-25, local Docker, release candidate

| | |
| --- | --- |
| Build | `main` with PRs for #7–#11 and #18–#22 (the v0.9-beta candidate) |
| Command | `docker compose up --build`, `MAIL_PROVIDER=log` (codes read from the backend log), `DEMO_DATA=true` |
| Browser | Chromium (Playwright), 1280×860, plus 360 px and 768 px for layout |
| Accounts | Student A = `250118120` (renamed "Aigerim N."), Student B = `250118111` ("Dauren K."), Student C = `250118121` ("Timur S.") |
| Automated | `mvn test`: 21 tests pass, including the API flows for sign-in, applying and organizer decisions |

Every case ran through the UI unless marked "API". No workaround was needed this time.

| ID | Actual (run 2) | Result |
| --- | --- | --- |
| TC-01 | Code sent ("Check your email"), code from the log accepted, account 27 created, redirected to Browse. | Pass |
| TC-02 | 8-digit ID: "Your SDU email is your 9-digit student ID…". No code sent. | Pass |
| TC-03 | Empty: "Enter your student ID." | Pass |
| TC-04 | Correct code: signed in, `/browse`. | Pass |
| TC-05 | Wrong code: "Wrong code. Check your email and try again."; not signed in. | Pass |
| TC-06 | Covered by the code expiry rule (10 min) in `AuthService`; not re-run by waiting. Run 1 result stands. | Pass (run 1) |
| TC-07 | 5-digit code: "Enter the 6-digit code from your email." | Pass |
| TC-08 | Signed out, `/groups`, `/requested`, `/profile` show **Log in**; `/groups/9` redirects to sign-in. API without token 401, with another user's token 403 (fixed in #6). | Pass |
| TC-09 | "QA run 2 group" created for tomorrow, level Beginner; listed on Browse with A as organizer. | Pass |
| TC-10 | UI offers only today and later, and refuses a slot that already started today. API with yesterday: 400 `meetingDate`. | Pass |
| TC-11 | 256-character title: "The title can be at most 255 characters (now 256)." under the title field. | Pass |
| TC-12 | Empty code, title and description: an error under each of the three fields plus "Please fix the fields marked in red." (#9 fixed). | Pass |
| TC-13 | Every card shows subject, place, day and time. No fake card (#8 fixed). | Pass |
| TC-14 | Filters with no match: "No groups match these filters." only. | Pass |
| TC-15 | Group page: subject, place, time, organizer, members; exact spot only after acceptance. | Pass |
| TC-16 | API `/groups/999999`: 404 "Study group with id 999999 not found"; the page shows the message, navbar works. | Pass |
| TC-17 | Application form opens; empty course, level and times give four field errors; nothing sent (#7 fixed). | Pass |
| TC-18 | All answers filled, note added: request sent, "Request sent. Your match score is 70%…". | Pass |
| TC-19 | One PENDING request; button changes to "Request sent · view". | Pass |
| TC-20 | API second request: 409 "You have already applied to this study group". | Pass |
| TC-21 | API own group: 409 "You cannot apply to your own study group". | Pass |
| TC-22 | Covered by `JoinRequestServiceImpl` and run 1; finished meetings of today are now refused too (#21). | Pass (run 1) |
| TC-23 | A sees B's level, free time, note and score breakdown. | Pass |
| TC-24 | B opens A's applicants URL: redirected to the public group page, no applicant data; API 403 (#10 fixed). | Pass |
| TC-25 | A accepts B: "Accepted · 70% match", in the group, seats 3 → 2. | Pass |
| TC-26 | API accept again: 409 "Join request is already accepted". | Pass |
| TC-27 | A declines C: status REJECTED, C not in the members list. | Pass |
| TC-28 | API reject the accepted request: 409 "Join request is already accepted"; still ACCEPTED. | Pass |
| TC-29 | Through the UI now: B (Advanced) applies to A's Beginner group with the same course and a covering free time, no preferences: **70 %**, breakdown 100 / 100 / 0 / 0. | Pass |
| TC-30 | API: size-2 group with one accepted member, C applies: 409 "Study group is full". | Pass |
| TC-31 | UI note of 501 characters: "The note can be at most 500 characters." under the note, counter turns red; nothing sent. | Pass |

Layout check (NFR-06, #18): no page scrolls sideways at 360 px or 768 px: Login, Browse, Create, My groups, Requested, Profile, Group details, Applicants.

### Run 2 result summary

| Status | Count |
| --- | --- |
| Pass | 31 (two of them by the run 1 result, see TC-06 and TC-22) |
| Fail | 0 |

## Run 3: production (Week 13)

To run after the v0.9-beta tag is deployed (see [`../DEPLOY.md`](../DEPLOY.md)), on https://studymate.onrender.com, from a phone and a second computer, starting from empty accounts and real email codes. Copy the table above, fill in *Actual* and *Result*, and log every failure as an issue.

| | |
| --- | --- |
| Date | |
| Build | `v0.9-beta` |
| Devices | |
| Result | Not run yet: production is created by the steps in `DEPLOY.md` |

## All issues

| Issue | Severity | Area | From | Status |
| --- | --- | --- | --- | --- |
| [#4](https://github.com/aliwer-qanadil/studymate/issues/4) POST/PUT/PATCH through Docker frontend fail with 403 | Critical | frontend | TC-01 | Fixed (PR #12) |
| [#5](https://github.com/aliwer-qanadil/studymate/issues/5) `docker compose up` never starts the frontend | Critical | backend | setup | Fixed (PR #13) |
| [#6](https://github.com/aliwer-qanadil/studymate/issues/6) API has no authentication | Critical | auth | TC-08, TC-24 | Fixed (PR #14) |
| [#7](https://github.com/aliwer-qanadil/studymate/issues/7) No application form; every applicant scores 100% | Major | frontend | TC-17, TC-18 | Fixed |
| [#8](https://github.com/aliwer-qanadil/studymate/issues/8) Fake hard-coded PHYS 121 card on Browse | Major | frontend | TC-13, TC-14 | Fixed |
| [#9](https://github.com/aliwer-qanadil/studymate/issues/9) Create form doesn't mark empty or too-long fields | Minor | frontend | TC-12 | Fixed |
| [#10](https://github.com/aliwer-qanadil/studymate/issues/10) Applicants page for a non-organizer says "not found" and labels them OWNER | Minor | frontend | TC-24 | Fixed |
| [#11](https://github.com/aliwer-qanadil/studymate/issues/11) Halloween pumpkins cover the Post request button | Minor | frontend | exploratory | Fixed |
| [#18](https://github.com/aliwer-qanadil/studymate/issues/18) Pages overflow sideways on a phone | Major | frontend | Week 13 UI pass | Fixed |
| [#19](https://github.com/aliwer-qanadil/studymate/issues/19) Blank pages while loading; tab title "studymate" | Minor | frontend | Week 13 UI pass | Fixed |
| [#20](https://github.com/aliwer-qanadil/studymate/issues/20) Backend can't be deployed: CORS and mail hard-coded | Major | backend | Week 11 | Fixed |
| [#21](https://github.com/aliwer-qanadil/studymate/issues/21) Meetings that ended today are still listed and joinable | Minor | backend | run 2 | Fixed |
| [#22](https://github.com/aliwer-qanadil/studymate/issues/22) Simultaneous requests can create duplicates | Minor | backend | Week 12 review | Fixed |

Update this file after each run. Log every Fail as a GitHub Issue.
