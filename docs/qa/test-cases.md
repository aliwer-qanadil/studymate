# StudyMate manual test cases (Week 10)

Covers every Must-have user story in `docs/SRS.md`: US-01, US-02, US-05, US-06, US-09, US-10, US-11, US-13, US-14, US-15 and US-17. Each story has a normal case and at least one edge case.

**Status: not yet executed.** Results must be recorded by running the application (`docker compose up --build`, then http://localhost:3000). Expected results come from the backend validation rules and error messages in the code. Fill in *Actual* and *Result* for each run. A failure becomes a GitHub Issue titled `[Severity] Short description`, labelled with its severity and area.

Test accounts: use two different 9-digit student IDs, call them **Student A** (organizer) and **Student B** (applicant). Demo data is off by default in deployments; for a local run set `DEMO_DATA=true` in `.env`.

| ID | Story | Type | Steps | Expected result | Actual | Result |
| --- | --- | --- | --- | --- | --- | --- |
| TC-01 | US-01 | Normal | Enter a valid 9-digit student ID, request a code, enter the 6-digit code from email. | Signed in; the account exists and the app opens. | | Not run |
| TC-02 | US-01 | Edge: wrong format | Enter an 8-digit student ID and submit. | Field error: "must be a 9-digit student ID". No code is sent. | | Not run |
| TC-03 | US-01 | Edge: empty field | Leave the student ID empty and submit. | Submission blocked with a field error. | | Not run |
| TC-04 | US-02 | Normal | Sign in with the correct code from the email. | Access granted. | | Not run |
| TC-05 | US-02 | Edge: wrong code | Enter a 6-digit code that is not the one sent. | Access denied with a clear error. The user is not signed in. | | Not run |
| TC-06 | US-02 | Edge: expired code | Wait until the code expires, then enter it. | Access denied; the message says the code is no longer valid. | | Not run |
| TC-07 | US-02 | Edge: wrong format | Enter a 5-digit code or letters in the code field. | Field error: "must be the 6-digit code from your email". | | Not run |
| TC-08 | US-02 | Edge: logged-out access | Signed out, open `/groups`, `/requested` and `/profile` directly. | Each page redirects to sign-in, or shows a sign-in prompt. No private data is shown. | | Not run |
| TC-09 | US-05 | Normal | Signed in as Student A: create a group with title, subject, course code, place, a meeting date of tomorrow and a start and end time. | The group appears in the list; Student A is shown as organizer. | | Not run |
| TC-10 | US-05 | Edge: past date | Set the meeting date to yesterday and submit. | Group not created; the date field shows an error. | | Not run |
| TC-11 | US-05 | Edge: very long text | Enter a 256-character title and submit. | Rejected with a length error; group not created. | | Not run |
| TC-12 | US-05 | Edge: empty required fields | Leave the subject or place empty and submit. | Submission blocked; the empty fields are marked. | | Not run |
| TC-13 | US-06 | Normal | Open the group list with at least one upcoming group. | Each group shows its subject, place and time. | | Not run |
| TC-14 | US-06 | Edge: empty state | Apply a filter that matches no group. | Empty-state message is shown; no error. | | Not run |
| TC-15 | US-09 | Normal | Open a group from the list. | Subject, place, time and organizer are shown. | | Not run |
| TC-16 | US-09 | Edge: unknown group | Open `/groups/999999` in the address bar. | A "not found" message is shown; the app does not crash. | | Not run |
| TC-17 | US-10 | Edge: required answers empty | Open the application form for Student A's group as Student B, leave required answers empty, try to submit. | Errors on each empty required field; submission blocked. | | Not run |
| TC-18 | US-10 | Normal | Fill in all required answers and submit. | Application is accepted and the confirmation is shown. | | Not run |
| TC-19 | US-11 | Normal | Student B submits a complete application to Student A's group. | One request is saved with status Pending; confirmation shown. | | Not run |
| TC-20 | US-11 | Edge: duplicate | Student B submits a second application to the same group. | Error: "You have already applied to this study group". No second request. | | Not run |
| TC-21 | US-11 | Edge: own group | Student A applies to a group Student A organizes. | Error: "You cannot apply to your own study group". | | Not run |
| TC-22 | US-11 | Edge: past meeting | Apply to a group whose meeting date has passed. | Error: "This meeting has already taken place". | | Not run |
| TC-23 | US-13 | Normal | Student A opens the applicants page for their group. | Each Pending request shows the candidate's answers and score. | | Not run |
| TC-24 | US-13 | Edge: not organizer | Student B opens the applicants page for Student A's group by URL. | Access denied; no candidate data shown. | | Not run |
| TC-25 | US-14 | Normal | Student A accepts a Pending request. | Status becomes Accepted; Student B appears among the members. | | Not run |
| TC-26 | US-14 | Edge: accept twice | Accept the same request again (second tab or API call). | Error: "Join request is already accepted". No second membership. | | Not run |
| TC-27 | US-15 | Normal | Student A rejects a Pending request. | Status becomes Rejected; Student B is not added. | | Not run |
| TC-28 | US-15 | Edge: decide after decision | Reject a request that is already Accepted. | Error: "Join request is already accepted". Status unchanged. | | Not run |
| TC-29 | US-17 | Normal | Student B applies with the same subject and overlapping time, but a different level and no shared preferences. | Score shown as 70% (40 subject + 30 time). | | Not run |
| TC-30 | US-17 | Edge: full group | Apply to a group that already has its maximum number of members. | Error: "Study group is full". | | Not run |
| TC-31 | US-17 | Edge: long note | Enter a note of more than 500 characters in the application. | Rejected with a length error. | | Not run |

## Result summary

| Status | Count |
| --- | --- |
| Pass | 0 |
| Fail | 0 |
| Not run | 31 |

Update this table after each run. Log every Fail as a GitHub Issue.
