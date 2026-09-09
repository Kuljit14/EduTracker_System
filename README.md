# AIMT Tracker — Ambition Institute of Management & Technology

AIMT Tracker is the dedicated Student Progress & Learning Portal for the **Ambition Institute of Management & Technology**. It pairs a modern web frontend with a production-ready **Java Spring Boot** REST backend and a **MySQL Database** for persistent relational storage.

---

## 🚀 Features

- **Dual-Role Web Portal**:
  - **Student Portal**: Learning progress dashboard, enrolled courses with topic progression, attendance overview, marked assessments, and real-time class confirmation submission.
  - **Teacher Portal**: Student directory, attendance monitor, individual schedule overrides, course topic manager (add, edit, reorder, mark current), batch enrollments, and lesson scheduler.
- **RESTful Spring Boot Backend**:
  - Full CRUD operations for Courses, Topics, Students, Schedules, and Confirmations.
  - Spring Data JPA with **MySQL Database** (`edutracker_db`).
  - Automated table creation/update (`spring.jpa.hibernate.ddl-auto=update`).
  - Automated database creation (`createDatabaseIfNotExist=true`).
  - Global CORS support for seamless multi-origin access.
- **Single-Artifact Deployment**:
  - The frontend assets (`index.html`, `Style.css`, `Script.js`) are served directly from Spring Boot's `static` resources at `http://localhost:8080/`.

---

## 🗄️ MySQL Database Setup

The application is configured to connect to MySQL on standard port `3306`:
- **Database Name**: `edutracker_db` (automatically created on first run via `createDatabaseIfNotExist=true`)
- **Default Username**: `root`
- **Default Password**: `root`

You can customize credentials in `src/main/resources/application.properties` or set environment variables:
```properties
spring.datasource.url=jdbc:mysql://${MYSQL_HOST:localhost}:${MYSQL_PORT:3306}/${MYSQL_DB:edutracker_db}?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=${MYSQL_USER:root}
spring.datasource.password=${MYSQL_PASSWORD:root}
```

---

## 🛠️ Prerequisites

- **Java 17** or higher JDK installed.
- **MySQL 8.x** running locally on port 3306 (or through XAMPP, WAMP, Docker).
- **Maven** (or use the included wrapper).

---

## 🏃 Running the Application

In a terminal inside `E:\EduTraker`:

### Using Maven:
```bash
mvn clean spring-boot:run
```

### Running Tests:
```bash
mvn test
```

### Building the Executable JAR:
```bash
mvn clean package
java -jar target/edutrack-backend-1.0.0.jar
```

---

## 🌐 Accessing the Application

- **Web Portal**: [http://localhost:8080](http://localhost:8080)
- **MySQL Database**: `edutracker_db` (viewable via MySQL Workbench, DBeaver, or phpMyAdmin)

---

## 📡 REST API Reference

### Courses & Topics
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/courses` | List all courses with topics and settings |
| `GET` | `/api/courses/{id}` | Get course details |
| `PUT` | `/api/courses/{id}/settings` | Update course description, announcement, default day/time |
| `POST` | `/api/courses/{id}/topics` | Add a new topic to a course |
| `PUT` | `/api/courses/{id}/topics/{index}` | Edit a topic's name/description |
| `PUT` | `/api/courses/{id}/topics/{index}/current` | Mark a topic as the currently active topic |
| `PUT` | `/api/courses/{id}/topics/reorder` | Shift a topic up or down |
| `DELETE` | `/api/courses/{id}/topics/{index}` | Remove a topic |
| `POST` | `/api/courses/{id}/enroll` | Batch enroll students |
| `POST` | `/api/courses/{id}/unenroll` | Batch unenroll students |

### Students
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/students` | Get all students (supports `?search=` and `?courseFilter=`) |
| `GET` | `/api/students/{id}` | Get single student details |
| `PUT` | `/api/students/{id}` | Update student name, attendance, or enrollments |
| `POST` | `/api/students/{id}/override` | Save an individual student schedule override |
| `DELETE` | `/api/students/{id}/override/{courseIndex}` | Reset individual schedule override |

### Schedules & Confirmations
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/schedules` | List all scheduled lessons |
| `POST` | `/api/schedules` | Add a new lesson schedule |
| `DELETE` | `/api/schedules/{id}` | Remove a scheduled lesson |
| `GET` | `/api/confirmations` | List recent student confirmations & feedback |
| `POST` | `/api/confirmations` | Submit student lesson confirmation & update progress |
