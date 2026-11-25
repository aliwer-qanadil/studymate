# Study Mate — backend

Spring Boot 4 (Java 21) REST API with PostgreSQL. See the [main README](../README.md) for the whole project,
[`docs/API.md`](../docs/API.md) for the endpoints and [`docs/DEPLOY.md`](../docs/DEPLOY.md) for deployment.

```bash
# Needs Java 21, Maven and a PostgreSQL on localhost:5432 (database, user and password "studymate"),
# for example: docker compose up db   (then use DB_PORT=5434)
mvn spring-boot:run          # http://localhost:8080/api/health
mvn test                     # unit and API tests
```

Without email settings the login code is printed in the console (`Login code for ...`).
All settings are environment variables; the list is in [`../.env.example`](../.env.example).

| Folder | What is there |
| --- | --- |
| `controller/` | HTTP endpoints under `/api` |
| `service/` | Business rules: login codes, sessions, groups, join requests, compatibility score |
| `entity/`, `repository/` | Database tables (JPA) and queries |
| `dto/`, `mapper/` | Request and response shapes |
| `config/` | Login check (`AuthInterceptor`), CORS, rate limit, demo data |
| `exception/` | Error responses in the RFC 9457 problem format |
