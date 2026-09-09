-- AIMT Tracker MySQL Database Schema
CREATE DATABASE IF NOT EXISTS edutracker_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE edutracker_db;

CREATE TABLE IF NOT EXISTS courses (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(100),
    meta VARCHAR(255),
    progress INT DEFAULT 0,
    description VARCHAR(1000),
    announcement VARCHAR(1000),
    day VARCHAR(50),
    time VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_topics (
    course_id INT NOT NULL,
    topic_order INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description VARCHAR(1000),
    status VARCHAR(50) DEFAULT 'upcoming',
    PRIMARY KEY (course_id, topic_order),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS course_learning_points (
    course_id INT NOT NULL,
    point_order INT NOT NULL,
    learning_points VARCHAR(500),
    PRIMARY KEY (course_id, point_order),
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    initials VARCHAR(10),
    attendance INT DEFAULT 100
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_enrollments (
    student_id VARCHAR(50) NOT NULL,
    enrollment_order INT NOT NULL,
    enrollments INT NOT NULL,
    PRIMARY KEY (student_id, enrollment_order),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_progress (
    student_id VARCHAR(50) NOT NULL,
    course_index INT NOT NULL,
    progress_value INT DEFAULT 0,
    PRIMARY KEY (student_id, course_index),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_schedule_overrides (
    student_id VARCHAR(50) NOT NULL,
    course_index INT NOT NULL,
    day VARCHAR(50),
    time VARCHAR(50),
    PRIMARY KEY (student_id, course_index),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS student_completions (
    student_id VARCHAR(50) NOT NULL,
    course_index INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    PRIMARY KEY (student_id, course_index, topic),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS class_schedules (
    id VARCHAR(100) PRIMARY KEY,
    course_index INT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    time VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS confirmations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50),
    student VARCHAR(255),
    course_index INT,
    topic VARCHAR(255),
    comment VARCHAR(2000),
    date VARCHAR(50),
    submitted_at VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
