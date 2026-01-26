# Multi-stage build pour optimiser la taille de l'image

# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copier les fichiers Maven
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Donner les permissions d'exécution au wrapper Maven
RUN chmod +x ./mvnw

# Télécharger les dépendances (mise en cache)
RUN ./mvnw dependency:go-offline -B

# Copier le code source
COPY src src

# Construire l'application (skip tests pour build plus rapide)
RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copier le JAR depuis le stage de build
COPY --from=build /app/target/*.jar app.jar

# Exposer le port de l'application
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Point d'entrée
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
