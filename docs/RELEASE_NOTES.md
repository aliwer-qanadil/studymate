# Release notes

## v0.9-beta — 25 November 2026

First public beta. Code freeze starts with this release: until the final defense only fixes for logged bugs are merged ([rules](../CONTRIBUTING.md#code-freeze)).

### What's included

- **Sign in with an SDU student ID** and a 6-digit code emailed to `<studentId>@sdu.edu.kz`. The first sign-in creates the account; no passwords.
- **Browse** upcoming groups with subject, place, time and free seats; filter by subject, place, part of day, today / next 7 days, or search; groups in your subjects first; groups picked for you from your profile.
- **Create a group** with course, level, place, an exact spot for accepted members only, day, time slot, size and study preferences, with an error under every invalid field.
- **Apply** with an application form (course, level, free time, preferences, note) prefilled from your profile.
- **Compatibility score** 0–100 % with its breakdown: subject 40, time 30, level 20, preferences 10.
- **Organizer review:** applicants sorted by match, accept or decline, groups close when full, cancel a group.
- **Applicant status:** waiting, accepted or not accepted; cancel a request; add an accepted meeting to the calendar.
- **Profile:** username, subjects and levels, usual free time, study style, favourite places, session history.
- Kazakh, Russian and English; dark mode; works on phones.
- Runs locally with one command (`docker compose up --build`); staging and production on Render with separate databases; CI with 21 automated backend tests.

### Fixed since the Week 10 test run

Critical: #4 (403 on every save behind nginx), #5 (frontend never started), #6 (API had no authentication).
Major: #7 (no application form), #8 (fake Browse content), #18 (pages overflowed on phones), #20 (backend couldn't be deployed).
Minor: #9, #10, #11, #19, #21, #22.

### Known limitations

- **First load after a pause is slow.** The free hosting plan stops the services after 15 minutes without visitors; the next visit waits up to a minute while they start.
- **Login emails may land in spam** the first time, because they come from a free email service. Brevo's free plan sends at most 300 emails a day.
- **No notifications.** Organizers and applicants see new requests and decisions when they open the app; nothing is emailed (outside the SRS scope).
- **Chat, shared files and ratings** are not included (outside the SRS scope).
- **Only SDU students** can sign in: the code goes to the SDU email of the student ID.
- **Performance and usability targets (NFR-01, NFR-04) have not been measured yet**: no load test or five-person usability test has been run. See `docs/SRS.md`, section 7.3.
- **Fixed time slots** on the create form (09–11, 11–13, 14–16, 16–18, 18–20) and only the next three days.

### Open issues and decisions

There are no open Critical or Major issues. Any issue opened after this release is triaged as *fix now* (a bug fix through a reviewed pull request, checked on staging) or *known limitation* (added to the list above).
