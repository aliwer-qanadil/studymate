# Study Mate API

Base address: `/api` on the website (nginx forwards it), or `http://localhost:8080/api` when the backend runs alone. Bodies are JSON. Times are `HH:mm`, dates `YYYY-MM-DD`, in Almaty time.

## Authentication

1. `POST /api/auth/send-code` emails a 6-digit code to `<studentId>@sdu.edu.kz`.
2. `POST /api/auth/verify-code` returns `{ id, name, token }`. The first successful sign-in creates the account.
3. Send `Authorization: Bearer <token>` with every `/api/users/{userId}/...` request. `{userId}` must be the signed-in user's own id. Tokens last 30 days or until logout.

| Situation | Status |
| --- | --- |
| No token, unknown or expired token | `401` |
| `{userId}` is someone else | `403` |

## Errors

Errors use the RFC 9457 problem format. Validation errors list each field:

```json
{ "status": 400, "title": "Bad Request", "detail": "Validation failed",
  "errors": { "title": "size must be between 0 and 255", "meetingDate": "must be a date in the present or in the future" } }
```

| Status | Meaning |
| --- | --- |
| 400 | A field is missing, too long or in the wrong format |
| 401 | Not signed in, or wrong / expired login code |
| 403 | Signed in, but not allowed (someone else's account or group) |
| 404 | The group, request or user does not exist |
| 409 | A business rule says no: already applied, own group, group full, meeting passed, request already decided |
| 429 | Too many login codes: wait a minute per student ID, at most 10 codes per network address in 15 minutes |
| 503 | Email could not be sent, or the database is down |

## Endpoints

### Public

| Method and path | Body / query | Answer |
| --- | --- | --- |
| `GET /api/health` | – | `200 {"status":"UP","database":"UP"}`, or `503` |
| `POST /api/auth/send-code` | `{ "studentId": "250118021" }` (9 digits) | `204` |
| `POST /api/auth/verify-code` | `{ "studentId": "250118021", "code": "123456" }` | `200 { "id": 7, "name": "250118021", "token": "…" }` |
| `POST /api/auth/logout` | header `Authorization: Bearer …` | `204` |
| `GET /api/groups` | optional `courseCode`, `place` (`LIBRARY`, `CANTEEN`, `TOP_FLOOR`), `level`, `dateFrom`, `dateTo` | Open, upcoming groups, soonest first. The exact spot is never included |

### Profile (signed in)

| Method and path | Body | Answer |
| --- | --- | --- |
| `GET /api/users/{userId}/profile` | – | Name, student ID, subjects, study style, places, free time, session counts, recent sessions |
| `PUT /api/users/{userId}/profile` | `{ "subjects": [{ "subjectName": "Calculus II", "courseCode": "MATH 161", "level": "BEGINNER" }], "studyStyle": "QUIET_WORK", "favouritePlaces": ["LIBRARY"], "availableFrom": "13:00", "availableTo": "19:00" }` | The updated profile. Free time is optional, but both or neither |
| `PUT /api/users/{userId}/name` | `{ "name": "Aigerim N." }` | `{ id, name }`; `409` if taken |

### Groups (signed in)

| Method and path | Body | Answer |
| --- | --- | --- |
| `POST /api/users/{userId}/groups` | see below | `201` the group; the user is its organizer |
| `GET /api/users/{userId}/groups` | – | Groups the user organizes |
| `GET /api/users/{userId}/groups/{groupId}` | – | One group; `exactSpot` only for the organizer and accepted members |
| `PATCH /api/users/{userId}/groups/{groupId}/cancel` | – | Cancels the group (organizer only); waiting requests are declined |

```json
{
  "title": "Integration techniques", "description": "Practice set, then explain solutions",
  "subjectName": "Calculus II", "courseCode": "MATH 161", "level": "BEGINNER",
  "place": "LIBRARY", "exactSpot": "2nd floor, table 14",
  "meetingDate": "2026-11-26", "startTime": "16:00", "endTime": "18:00",
  "preferences": ["QUIET_WORK"], "groupSize": 4
}
```

Rules: title ≤ 255, description ≤ 2000, course code ≤ 32 characters; date today or later and, for today, a start time that hasn't passed; end after start; size 2–10 including the organizer. `level`: `BEGINNER`, `INTERMEDIATE`, `ADVANCED`. `preferences`: `QUIET_WORK`, `TALKATIVE`, `MIXED_GROUP`, `WOMEN_ONLY`, `MEN_ONLY`, `SAME_YEAR`, `ANY_LEVEL`.

### Join requests (signed in)

| Method and path | Who | Answer |
| --- | --- | --- |
| `POST /api/users/{userId}/groups/{groupId}/requests` | Applicant | `201` the request with `score` and `breakdown`, status `PENDING` |
| `GET /api/users/{userId}/requests` | Applicant | Their requests and statuses, newest first |
| `PATCH /api/users/{userId}/requests/{requestId}/cancel` | Applicant | Withdraws a pending request |
| `GET /api/users/{userId}/groups/{groupId}/requests` | Organizer | All requests to the group, best match first; `403` for anyone else |
| `PATCH /api/users/{userId}/requests/{requestId}/accept` | Organizer | `ACCEPTED`, applicant becomes a member; the group is `FULL` when no seats are left |
| `PATCH /api/users/{userId}/requests/{requestId}/reject` | Organizer | `REJECTED` |

Application body:

```json
{ "courseCode": "MATH 161", "level": "INTERMEDIATE", "availableFrom": "15:00", "availableTo": "19:00",
  "preferences": ["QUIET_WORK"], "note": "I can explain chapter 5." }
```

Course code, level and both times are required; `note` ≤ 500 characters. Refused with `409` when: it is the applicant's own group, they already have a request that isn't cancelled, the group is full or cancelled, or the meeting has ended. Deciding a request that is not `PENDING` answers `409 "Join request is already accepted"` (or rejected / cancelled).

### Compatibility score

Each part is 0–100; the total is `0.4·subject + 0.3·time + 0.2·level + 0.1·preferences`, rounded.

| Part | 100 | Partial | 0 |
| --- | --- | --- | --- |
| Subject | Same course code (spaces and case ignored) | 50: same department, e.g. MATH 161 vs MATH 162 | Different department |
| Time | The whole meeting fits the applicant's free time | Share of the meeting that fits | No overlap |
| Level | Same level, or the group allows any level | 50: one level apart | Two levels apart |
| Preferences | Applicant shares all of the group's preferences, or the group has none | Share of the group's preferences they share | None shared |

Example from the SRS (US-17): same course and time, two levels apart, no shared preference → 40 + 30 + 0 + 0 = **70 %**.
