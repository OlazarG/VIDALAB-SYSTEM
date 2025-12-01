# Sifen POC - Guía de Ejecución

Este proyecto es una Prueba de Concepto (POC) para el Sistema de Facturación Electrónica Nacional (SIFEN) de Paraguay.

## 📋 Requisitos Previos

Asegúrate de tener instalado:
1.  **Java 17** o superior (Tienes Java 21, lo cual es perfecto).
2.  **Maven** (Tienes la versión 3.9.11).

## 🚀 Cómo ejecutar el proyecto

### Opción 1: Desde tu IDE (Recomendado)
1.  Abre el archivo `src/main/java/com/example/sifenpoc/SifenPocApplication.java`.
2.  Haz clic derecho sobre el archivo o busca el botón de "Run" (triángulo verde) al lado de la clase o el método `main`.
3.  Selecciona **"Run SifenPocApplication"**.

### Opción 2: Desde la Terminal (PowerShell / CMD)

Para ejecutarlo desde la terminal, primero debes asegurarte de que `mvn` y `java` sean reconocidos.

#### 1. Configuración de Variables de Entorno (Solo si falla el comando `mvn`)
Si al escribir `mvn -version` te sale un error, necesitas configurar el PATH.

**Solución Temporal (para la terminal actual):**
Ejecuta esto antes de correr el proyecto:
```powershell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-21"
$env:Path = "C:\Apache\apache-maven-3.9.11\bin;" + $env:Path
```

**Solución Permanente:**
Agrega `C:\Apache\apache-maven-3.9.11\bin` a tus Variables de Entorno de Windows (Path).

#### 2. Ejecutar la aplicación
Una vez configurado el entorno, ejecuta:

```powershell
mvn spring-boot:run
```

## ⚠️ Solución de Problemas Comunes

### Error: "Port 8080 was already in use"
Si ves este error, significa que otro programa está usando el puerto por defecto.
El proyecto está configurado actualmente para usar un **puerto aleatorio** (`server.port=0` en `application.properties`) para evitar esto.

Busca en la consola una línea como esta para saber en qué puerto inició:
`Tomcat started on port 59866 (http)`

Luego abre tu navegador en: `http://localhost:59866` (reemplaza el número por el que te salga).
