# Step 1: build the Spring Boot jar with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
# Download the libraries first, so code changes don't download them again
RUN --mount=type=cache,target=/root/.m2 mvn -B -q dependency:go-offline
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -B -q package -DskipTests

# Step 2: run the jar on a small Java runtime image
FROM eclipse-temurin:21-jre
WORKDIR /app
# Run as a non-root user
RUN useradd --system --uid 10001 studymate
COPY --from=build /app/target/*.jar app.jar
USER studymate
# Use at most 75% of the container's memory, so it fits free 512 MB plans
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
