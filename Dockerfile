# ==========================================
# Stage 1: Build the React Frontend
# ==========================================
FROM node:23-alpine AS frontend-builder
WORKDIR /app

# Copy only the frontend package files first (for better caching)
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install

# Copy the rest of the frontend source code
COPY frontend/ ./

# Build the React app.
# Thanks to your Vite config, this will output to /app/src/main/resources/static
RUN npm run build


# ==========================================
# Stage 2: Build the Spring Boot Backend
# ==========================================
FROM maven:3.9.6-eclipse-temurin-21 AS backend-builder
WORKDIR /app

# Copy the pom.xml and source code
COPY pom.xml .
COPY src ./src

# Copy the built React UI from Stage 1 into the Spring Boot static folder
COPY --from=frontend-builder /app/src/main/resources/static ./src/main/resources/static

# Build the final Spring Boot executable JAR (skipping tests to speed up the build)
RUN mvn clean package -DskipTests


# ==========================================
# Stage 3: Create the Minimal Final Image
# ==========================================
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy ONLY the final JAR file from Stage 2
COPY --from=backend-builder /app/target/*.jar app.jar

# Expose the standard Spring Boot port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]