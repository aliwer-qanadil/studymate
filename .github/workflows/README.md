# Continuous integration

`ci.yml` runs automatically on every push and pull request:

- **frontend**: installs packages, runs the code checker (`npm run lint`) and a production build.
- **backend**: runs the Spring Boot tests against a temporary PostgreSQL database.
- **docker**: builds both Docker images with `docker compose build`.

A red mark on a pull request means one of these checks failed. Open the run on GitHub to see which step.
