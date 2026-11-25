# README test by someone outside the team (Week 12)

The assignment asks for a person outside the team to follow the README on a clean machine and for every step where they got stuck to be fixed. This page records that test.

**How to run it:** give the reader only the repository link. They follow [the README](../../README.md#run-it-locally-about-10-minutes) on a computer that has never run the project, think aloud, and you write down every place they hesitate. Time it: the goal is under 15 minutes to a signed-in session.

| | |
| --- | --- |
| Reader (name, course) | |
| Date | |
| Computer and OS | |
| Time to a signed-in session | |

| Step in the README | What happened | Stuck? | Fix made (commit or PR) |
| --- | --- | --- | --- |
| Install Git and Docker | | | |
| `git clone` | | | |
| `docker compose up --build` | | | |
| Open http://localhost:3000 | | | |
| Get the login code from the log | | | |
| Sign in, create a group, apply from a second account | | | |

## Changes already made for a stranger

Before the outside test, the README was rewritten so that a first run needs nothing but Git and Docker:

- Email is no longer required to sign in locally: without settings, codes are printed in the backend log, and the README shows the exact command to read them.
- Ports, the database and demo data have defaults; `.env` is optional.
- The README gives the expected build time, the addresses to open, and how to free a port that is taken.
