# Traceability Table

Maps every interface field of the StudyMate screens (`src/pages`, `src/components`) to the ERD (`docs/StudyMate_ERD.drawio`).
This is a **database design** document: the ERD describes the planned schema and is not yet fully implemented in the backend code.

*(computed)* = the value is calculated from the listed stored attributes and is not stored itself. `—` = client-side only.

| UI Screen | Interface Field | ERD Entity | ERD Attribute |
|---|---|---|---|
| Sign In | SDU email | USER | email |
| Sign In | Password | USER | password |
| Sign In | Keep me signed in | — | — *(client-side token, not stored)* |
| Sign In | Language switcher KZ / RU / EN | — | — *(client-side setting, not stored)* |
| Browse | Filter: Subject | SUBJECT | name |
| Browse | Filter: Place | STUDY_REQUEST | place |
| Browse | Filter: Time | STUDY_REQUEST | start_time |
| Browse | Course tag (MATH 161) | SUBJECT | course_code |
| Browse | Request title | STUDY_REQUEST | title |
| Browse | Request description | STUDY_REQUEST | description |
| Browse | Place fact (Library · 2nd floor) | STUDY_REQUEST | place |
| Browse | Date & time fact | STUDY_REQUEST | study_date, start_time, end_time |
| Browse | Preference fact (Quiet work) | PREFERENCE | label *(via REQUEST_PREFERENCE)* |
| Browse | Match % badge | USER_SUBJECT / USER / REQUEST_PREFERENCE | USER_SUBJECT.skill_level, USER.quietness, REQUEST_PREFERENCE.preference_id *(match against the viewer profile)* |
| Browse | Seats left | STUDY_REQUEST / GROUP_MEMBER | STUDY_REQUEST.group_size, GROUP_MEMBER.member_id *(computed: group_size − COUNT(members))* |
| Browse | Group size | STUDY_REQUEST | group_size |
| Browse | Owner name / initials | USER | name |
| Browse | Owner faculty | PROGRAM | faculty |
| Browse | Owner year | USER | year |
| Browse | Owner rating (4.8) | RATING | reliability, behaviour, helpfulness *(computed: AVG over ratings received)* |
| Browse | Sidebar: sessions joined | GROUP_MEMBER | user_id *(computed: COUNT per user)* |
| Browse | Sidebar: Picked for you | STUDY_REQUEST | title, place, start_time *(computed: top matches)* |
| Create Request | Subject or course | SUBJECT | name |
| Create Request | Course code | SUBJECT | course_code |
| Create Request | Request title (live preview) | STUDY_REQUEST | title |
| Create Request | What will you do together? | STUDY_REQUEST | description |
| Create Request | Place on campus | STUDY_REQUEST | place |
| Create Request | Exact spot | STUDY_REQUEST | exact_spot |
| Create Request | Day | STUDY_REQUEST | study_date |
| Create Request | Time (start) | STUDY_REQUEST | start_time |
| Create Request | Time (end) | STUDY_REQUEST | end_time |
| Create Request | Group size (stepper) | STUDY_REQUEST | group_size |
| Create Request | Preferences (chips) | REQUEST_PREFERENCE / PREFERENCE | REQUEST_PREFERENCE.preference_id, PREFERENCE.label |
| Create Request | Women only / Men only (eligibility) | USER | gender *(computed: checked against applicant)* |
| Create Request | Review each applicant (toggle) | STUDY_REQUEST | review_applicants |
| Create Request | Post request / Save as draft | STUDY_REQUEST | status *(OPEN / DRAFT)* |
| Create Request | Owner “You · Year 2” | STUDY_REQUEST / USER | STUDY_REQUEST.owner_id, USER.year |
| Applicants | Course tag + title | SUBJECT / STUDY_REQUEST | SUBJECT.course_code, STUDY_REQUEST.title |
| Applicants | “3 seats left” | STUDY_REQUEST / GROUP_MEMBER | STUDY_REQUEST.group_size, GROUP_MEMBER.member_id *(computed: group_size − COUNT(members))* |
| Applicants | “5 students want to join” | APPLICATION | application_id, status *(computed: COUNT where status = PENDING)* |
| Applicants | Sort: Compatibility / Social rating / Newest | APPLICATION | created_at *(computed: plus computed score and rating)* |
| Applicants | Applicant name / initials | USER | name *(via APPLICATION.applicant_id)* |
| Applicants | Applicant faculty | PROGRAM | faculty |
| Applicants | Applicant year | USER | year |
| Applicants | Applicant note | APPLICATION | note |
| Applicants | Available time (join form) | APPLICATION | available_from, available_to |
| Applicants | Applicant preference tag (Quiet work) | APPLICATION / PREFERENCE | APPLICATION.preference_id, PREFERENCE.label |
| Applicants | Compatibility score (94) | APPLICATION | subject_score, time_score, level_score, preference_score *(computed: 0.4·subject + 0.3·time + 0.2·level + 0.1·preference)* |
| Applicants | Tier label (Strong / Good match) | APPLICATION | subject_score, time_score, level_score, preference_score *(computed: derived from total score)* |
| Applicants | Breakdown: Subject | APPLICATION | subject_score |
| Applicants | Breakdown: Time | APPLICATION | time_score |
| Applicants | Breakdown: Level | APPLICATION | level_score |
| Applicants | Breakdown: Preferences | APPLICATION | preference_score |
| Applicants | Tag “12 sessions” | GROUP_MEMBER | user_id *(computed: COUNT for applicant)* |
| Applicants | Tag “4.9 social rating” | RATING | reliability, behaviour, helpfulness *(computed: AVG for applicant)* |
| Applicants | Status / Accept / Decline | APPLICATION | status *(ACCEPTED also creates a GROUP_MEMBER row)* |
| Applicants | Applicants under 60% (reason line) | APPLICATION | available_from, available_to, preference_id |
| Group | Course code | SUBJECT | course_code *(via STUDY_GROUP.request_id)* |
| Group | Status “Group formed” | STUDY_GROUP | status |
| Group | Group title | STUDY_REQUEST | title |
| Group | Group description | STUDY_REQUEST | description |
| Group | When: Session Date | STUDY_SESSION | session_date |
| Group | When: Session Time | STUDY_SESSION | start_time, end_time |
| Group | Where: Session Place | STUDY_SESSION | place |
| Group | Where: Exact spot | STUDY_SESSION | exact_spot |
| Group | Group (4 of 4 members) | STUDY_REQUEST / GROUP_MEMBER | STUDY_REQUEST.group_size, GROUP_MEMBER.member_id *(computed: COUNT(members))* |
| Group | Member | GROUP_MEMBER / USER | GROUP_MEMBER.user_id, USER.name |
| Group | Member faculty | PROGRAM | faculty |
| Group | Member year | USER | year |
| Group | Member role (Teaching / Learning) | GROUP_MEMBER | role |
| Group | Member topic (trig substitution) | GROUP_MEMBER | topic |
| Group | Owner badge | STUDY_REQUEST / GROUP_MEMBER | STUDY_REQUEST.owner_id, GROUP_MEMBER.user_id *(owner = member with owner_id)* |
| Group | Member rating | RATING | reliability, behaviour, helpfulness *(computed: AVG per member)* |
| Group | Owner phone (privacy note) | USER | phone |
| Group | Meeting point | STUDY_SESSION | place, exact_spot |
| Group | Agenda: time | AGENDA_ITEM | start_time |
| Group | Agenda: text | AGENDA_ITEM | description |
| Group | Leave group | GROUP_MEMBER | member_id *(row deleted)* |
| Group (after session: rating) | Rated person | RATING | ratee_id |
| Group (after session: rating) | Reliability (did everyone show up?) | RATING | reliability |
| Group (after session: rating) | Behaviour (respectful?) | RATING | behaviour |
| Group (after session: rating) | Helpfulness | RATING | helpfulness |
| Group (after session: rating) | Session being rated | RATING | session_id |
| Profile | Name / initials | USER | name |
| Profile | Faculty | PROGRAM | faculty |
| Profile | Program | PROGRAM | name |
| Profile | Year | USER | year |
| Profile | Email badge | USER | email |
| Profile | Verified SDU student | USER | is_verified |
| Profile | Social rating (4.7) | RATING | reliability, behaviour, helpfulness *(computed: AVG over ratings received)* |
| Profile | Rating: Reliability | RATING | reliability |
| Profile | Rating: Behaviour | RATING | behaviour |
| Profile | Rating: Helpfulness | RATING | helpfulness |
| Profile | Session count (23) | GROUP_MEMBER / STUDY_SESSION | GROUP_MEMBER.user_id, STUDY_SESSION.status *(computed: COUNT of completed sessions)* |
| Profile | Subjects I study (chips) | USER_SUBJECT / SUBJECT | USER_SUBJECT.subject_id, SUBJECT.name |
| Profile | Active subject highlight | USER_SUBJECT | is_active |
| Profile | + Add subject (level) | USER_SUBJECT | skill_level |
| Profile | Stat: Sessions attended | GROUP_MEMBER | user_id *(computed: COUNT of completed sessions)* |
| Profile | Stat: Times you taught | GROUP_MEMBER | role *(computed: COUNT where role = TEACHING)* |
| Profile | Stat: Students met | GROUP_MEMBER | user_id *(computed: COUNT DISTINCT in shared groups)* |
| Profile | Quiet vs. talkative slider | USER | quietness |
| Profile | Preferred places (chips) | — | — *(not in this ERD — Could-have, out of MVP scope)* |
| Profile | Recent sessions: title | STUDY_REQUEST | title *(via STUDY_GROUP)* |
| Profile | Recent sessions: place · date | STUDY_SESSION | place, session_date |
| Profile | Recent sessions: You taught / Attended | GROUP_MEMBER | role |

## Coverage

- 105 interface fields mapped; 57 of 83 ERD attributes appear in the interface.
- Attributes without a screen field are technical keys and audit columns (`*_id` foreign keys used only for joins, `created_at`, `joined_at`) and `STUDY_GROUP.request_id`, `STUDY_SESSION.group_id`.
- Added beyond the original 10-entity plan, with the reason: `PROGRAM` (removes the transitive dependency program → faculty, 3NF), `USER_SUBJECT` (Profile subjects + skill level for the 20% level match), `AGENDA_ITEM` (Group agenda is a repeating group, 1NF).
- Not covered on purpose: *Preferred places* on Profile (Could-have).
