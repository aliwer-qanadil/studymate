# StudyMate manual test cases (Week 10)

Covers every Must-have user story in `docs/SRS.md`: US-01, US-02, US-05, US-06, US-09, US-10, US-11, US-13, US-14, US-15 and US-17. Each story has a normal case and at least one edge case.

Expected results come from the backend validation rules and error messages in the code. A failure becomes a GitHub Issue titled `[Severity] Short description`, labelled with its severity and area.

Test accounts: use two different 9-digit student IDs, call them **Student A** (organizer) and **Student B** (applicant). Demo data is off by default in deployments; for a local run set `DEMO_DATA=true` in `.env`.

## Run 1: 2026-11-20, local Docker

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

## Result summary

| Status | Count |
| --- | --- |
| Pass | 26 |
| Fail | 5 |
| Not run | 0 |

## Issues opened from this run

| Issue | Severity | Area | From |
| --- | --- | --- | --- |
| [#4](https://github.com/aliwer-qanadil/studymate/issues/4) Every POST/PUT/PATCH through the Docker frontend fails with 403 | Critical | frontend | TC-01 |
| [#5](https://github.com/aliwer-qanadil/studymate/issues/5) `docker compose up` never starts the frontend | Critical | backend | setup |
| [#6](https://github.com/aliwer-qanadil/studymate/issues/6) API has no authentication | Critical | auth | exploratory (TC-08, TC-24) |
| [#7](https://github.com/aliwer-qanadil/studymate/issues/7) No application form; every applicant scores 100% | Major | frontend | TC-17, TC-18 |
| [#8](https://github.com/aliwer-qanadil/studymate/issues/8) Fake hard-coded PHYS 121 card on Browse | Major | frontend | TC-13, TC-14 |
| [#9](https://github.com/aliwer-qanadil/studymate/issues/9) Create form doesn't mark empty or too-long fields | Minor | frontend | TC-12 |
| [#10](https://github.com/aliwer-qanadil/studymate/issues/10) Applicants page for a non-organizer says "not found" and labels them OWNER | Minor | frontend | TC-24 |
| [#11](https://github.com/aliwer-qanadil/studymate/issues/11) Halloween pumpkins cover the Post request button | Minor | frontend | exploratory |

Update this table after each run. Log every Fail as a GitHub Issue. Re-run on production before the v0.9-beta tag (Week 13).
