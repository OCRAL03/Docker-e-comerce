FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/gateway-1.0.0.jar app.jar
EXPOSE 8080
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
HEALTHCHECK --interval=10s --timeout=3s --retries=5 CMD curl -fs http://localhost:8080/actuator/health || exit 1
CMD ["java","-jar","app.jar"]
