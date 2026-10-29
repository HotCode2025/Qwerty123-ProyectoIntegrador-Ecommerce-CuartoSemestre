# Imagen del backend para el deploy en Render (Render no trae Java, por eso se usa Docker).
# Etapa 1: compila el proyecto con Maven. Etapa 2: solo el .jar sobre Java 21, más liviana.

FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Primero solo lo necesario para bajar las dependencias: si el código cambia pero el pom no,
# Docker reutiliza esta capa y el build es mucho más rápido
COPY mvnw pom.xml ./
COPY .mvn .mvn
RUN chmod +x mvnw && ./mvnw -q -B dependency:go-offline

COPY src src
RUN ./mvnw -q -B package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

# Se corre con un usuario sin permisos de administrador
RUN useradd --system --create-home goldenpoint
USER goldenpoint

COPY --from=build /app/target/*.jar app.jar

# Render indica el puerto con la variable PORT (application.yml ya la lee).
# MaxRAMPercentage ajusta la memoria de Java al límite del plan gratis (512 MB)
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+UseSerialGC"
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
