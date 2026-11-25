# Database: schema as built (v0.9-beta)

Hibernate creates these tables from the entities in `backend/src/main/java/com/studymate/studymate/entity/`. This replaces the Milestone 1 design ([`Database_Design.md`](Database_Design.md), [`schema.sql`](schema.sql)) as the description of the running system; those files stay as the original design record.

```mermaid
erDiagram
    users ||--o{ user_subjects : "studies"
    users ||--o{ user_places : "likes"
    users ||--o{ study_groups : "organizes"
    users ||--o{ join_requests : "applies"
    users ||--o{ login_sessions : "is signed in by"
    study_groups ||--o{ study_group_preferences : "wants"
    study_groups ||--o{ join_requests : "receives"
    join_requests ||--o{ join_request_preferences : "offers"

    users {
        bigint id PK
        varchar name UK "username, starts as the student ID"
        varchar email UK "studentId@sdu.edu.kz"
        varchar study_style "QUIET_WORK, MIXED_GROUP, TALKATIVE"
        time available_from "usual free time, optional"
        time available_to
    }
    user_subjects {
        bigint user_id FK
        int position
        varchar subject_name
        varchar course_code
        varchar level "BEGINNER, INTERMEDIATE, ADVANCED"
    }
    user_places {
        bigint user_id FK
        varchar place "LIBRARY, CANTEEN, TOP_FLOOR"
    }
    study_groups {
        bigint id PK
        bigint organizer_id FK
        varchar title
        varchar description
        varchar subject_name
        varchar course_code
        varchar level
        varchar place
        varchar exact_spot "only for organizer and accepted members"
        date meeting_date
        time start_time
        time end_time
        int group_size "including the organizer"
        int member_count "accepted members"
        varchar status "OPEN, FULL, CANCELLED"
        bigint version "optimistic lock: two accepts can't take one seat"
        timestamptz created_at
    }
    study_group_preferences {
        bigint group_id FK
        varchar preference
    }
    join_requests {
        bigint id PK
        bigint group_id FK
        bigint applicant_id FK
        varchar course_code
        varchar level
        time available_from
        time available_to
        varchar note
        int score "0-100"
        int subject_score
        int time_score
        int level_score
        int preference_score
        varchar status "PENDING, ACCEPTED, REJECTED, CANCELLED"
        timestamptz created_at
        timestamptz decided_at
    }
    join_request_preferences {
        bigint request_id FK
        varchar preference
    }
    login_codes {
        bigint id PK
        varchar email UK
        varchar code_hash "BCrypt"
        timestamptz sent_at
        timestamptz expires_at "10 minutes"
        int wrong_attempts "5 wrong tries delete the code"
    }
    login_sessions {
        bigint id PK
        bigint user_id
        varchar token_hash UK "SHA-256 of the token"
        timestamptz expires_at "30 days"
    }
```

## Differences from the Milestone 1 design

| Milestone 1 design (`schema.sql`) | As built | Why |
| --- | --- | --- |
| `users.password_hash` | No passwords; `login_codes` and `login_sessions` | Sign-in by a code emailed to the SDU address proves the student is from SDU and leaves no password to leak |
| UUID keys | `bigint` identity keys | Hibernate default; ids are never shown to users as secrets, and every private endpoint checks the session |
| `subjects` and `preference_options` lookup tables | Course code and subject name stored as text; preferences, places and levels as fixed enum values | SDU courses are entered by code; the fixed lists live in the code and translations |
| `meeting_start` / `meeting_end` timestamps | `meeting_date` plus `start_time` / `end_time` | The form picks a day and a time slot; all times are Almaty time |
| `user_availability` with several slots | One `available_from` / `available_to` on `users` | Enough to prefill the join form for the beta |
| Score calculated, not stored | Score and its four parts stored on `join_requests` | Calculated once at applying, so the organizer sees exactly what the applicant saw |
| Partial unique indexes `one_pending_request`, `one_accepted_membership` | One index `one_active_request_per_group` on `(group_id, applicant_id)` where status is `PENDING` or `ACCEPTED`, created at start-up by `DatabaseConstraints` | Hibernate cannot create partial indexes ([#22](https://github.com/aliwer-qanadil/studymate/issues/22)) |
| — | `status` and `version` on `study_groups`, `CANCELLED` request status | Groups close when full or cancelled; the version stops two accepts from taking the last seat |

## Known gaps

- `login_sessions.user_id` has no foreign key; sessions of a deleted user simply stop working. Accounts can't be deleted in the beta.
