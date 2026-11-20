# Step 1: build the Spring Boot jar with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
# The cache mount keeps downloaded Maven libraries between builds
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

# Step 2: run the jar on a small Java runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
# Run as a non-root user
RUN useradd --system --uid 10001 studymate
COPY --from=build /app/target/*.jar app.jar
USER studymate
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
