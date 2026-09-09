# AIMT Tracker — Ambition Institute of Management & Technology

AIMT Tracker is the dedicated Student Progress & Learning Portal for the **Ambition Institute of Management & Technology**. It pairs a modern web frontend with a production-ready **Java Spring Boot** REST backend and an embedded **H2 Database** for data persistence.

---

## 🚀 Features

- **Dual-Role Web Portal**:
  - **Student Portal**: Learning progress dashboard, enrolled courses with topic progression, attendance overview, marked assessments, and real-time class confirmation submission.
  - **Teacher Portal**: Student directory, attendance monitor, individual schedule overrides, course topic manager (add, edit, reorder, mark current), batch enrollments, and lesson scheduler.
- **RESTful Spring Boot Backend**:
  - Full CRUD operations for Courses, Topics, Students, Schedules, and Confirmations.
  - Spring Data JPA with embedded H2 database (persisted to `./data/edutrack`).
  - Automated database seeding on initial boot.
  - Built-in H2 Web Console.
  - Global CORS support for seamless multi-origin access.
- **Single-Artifact Deployment**:
  - The frontend assets (`index.html`, `Style.css`, `Script.js`) are served directly from Spring Boot's `static` resources at `http://localhost:8080/`.

---

## 📁 Project Structure

```
edutrack-backend/
├── pom.xml
├── README.md
├── src/
│   ├── main/
│   │   ├── java/com/edutrack/
│   │   │   ├── EduTrackApplication.java           # Spring Boot Application entry point & CORS
│   │   │   ├── config/
│   │   │   │   └── DataInitializer.java           # Seeds initial 6 students, 4 courses, and schedule
│   │   │   ├── controller/
│   │   │   │   ├── CourseController.java          # Endpoints for courses, topics & enrollments
│   │   │   │   ├── StudentController.java         # Endpoints for student records & schedule overrides
│   │   │   │   ├── ScheduleController.java        # Endpoints for class scheduling
│   │   │   │   └── ConfirmationController.java    # Endpoints for topic confirmations
│   │   │   ├── dto/                               # Request and response data transfer objects
│   │   │   ├── model/
│   │   │   │   ├── Course.java                    # Course JPA entity
│   │   │   │   ├── Student.java                   # Student JPA entity
│   │   │   │   ├── Topic.java                     # Embeddable Topic model
│   │   │   │   ├── ClassSchedule.java             # Class schedule entity
│   │   │   │   ├── Confirmation.java              # Student check-in feedback entity
│   │   │   │   ├── ScheduleOverride.java          # Student custom schedule override
│   │   │   │   └── CompletedTopic.java            # Student completed topic tracking
│   │   │   ├── repository/                        # Spring Data JPA repositories
│   │   │   └── service/                           # Business logic service layer
│   │   └── resources/
│   │       ├── application.properties             # Spring & H2 database configuration
│   │       └── static/                            # Frontend Web Application
│   │           ├── index.html
│   │           ├── Style.css
│   │           └── Script.js
│   └── test/
│       └── java/com/edutrack/
│           └── EduTrackApplicationTests.java      # Comprehensive automated tests
```

---

## 🛠️ Prerequisites

- **Java 17** or higher JDK installed.
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
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - **JDBC URL**: `jdbc:h2:file:./data/edutrack`
  - **User**: `sa`
  - **Password**: *(leave blank)*

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
