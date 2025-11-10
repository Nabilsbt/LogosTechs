# Image de base officielle Java 17
FROM eclipse-temurin:17-jdk

# Dossier de travail dans le conteneur
WORKDIR /app

# Copier ton JAR Spring Boot dans le conteneur
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar

# Exposer le port de ton service
EXPOSE 8301

# Lancer ton application
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
