# StudyMate v0.9-beta release notes (draft)

**Freeze date:** to be announced by the team.
**Status:** draft. Not tagged yet.

## What is included

- Sign-in with a student ID and a one-time code sent by email.
- Browse upcoming study groups, with subject, place and time.
- Create a study group as organizer.
- Open group details.
- Send a join request with answers and optional study preferences.
- Compatibility score (subject 40, time 30, level 20, preferences 10) shown to the organizer and in the applicant's request list.
- Organizer accepts or rejects requests.
- Profile with subjects and levels.
- Runs with one command: `docker compose up --build`.

## Known limitations

- There is no separate registration form. The account is created the first time a student signs in with a code.
- Subject, time and preference filters depend on the data in the list; see the test table for results.
- Demo data is available only when `DEMO_DATA=true`.
- Not deployed to a public address yet. See `docs/DEPLOY.md`.
- Chat, shared files, ratings and notifications are not included (outside the Must-have scope).

## Open items before the tag

- Test table results on the production URL (`docs/qa/test-cases.md`).
- Decisions on any Major issue without a fix.
