package com.edutrack;

import com.edutrack.dto.ConfirmationRequest;
import com.edutrack.model.Confirmation;
import com.edutrack.model.Course;
import com.edutrack.model.Student;
import com.edutrack.service.ConfirmationService;
import com.edutrack.service.CourseService;
import com.edutrack.service.StudentService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class EduTrackApplicationTests {

    @Autowired
    private CourseService courseService;

    @Autowired
    private StudentService studentService;

    @Autowired
    private ConfirmationService confirmationService;

    @Test
    void contextLoads() {
        assertNotNull(courseService);
        assertNotNull(studentService);
        assertNotNull(confirmationService);
    }

    @Test
    void testCreateRealStudentAndCourse() {
        Course course = new Course(99, "Java Programming", "JAVA-101", "Core Java", 0, "Core OOP", "Welcome", "Monday", "10:00");
        Course savedCourse = courseService.createCourse(course);
        assertNotNull(savedCourse);
        assertEquals("JAVA-101", savedCourse.getShortName());

        Student student = new Student("STU-TEST", "Test Student", "TS", 100);
        student.setEnrollments(new ArrayList<>());
        student.getEnrollments().add(99);
        Student savedStudent = studentService.createStudent(student);
        assertNotNull(savedStudent);
        assertEquals("Test Student", savedStudent.getName());

        ConfirmationRequest req = new ConfirmationRequest(
                "STU-TEST",
                "Test Student",
                99,
                "Variables & Datatypes",
                "Learned variables",
                "2026-09-09",
                "10:00 AM"
        );
        Confirmation conf = confirmationService.submitConfirmation(req);
        assertNotNull(conf.getId());

        Student updated = studentService.getStudentById("STU-TEST").orElseThrow();
        assertEquals(5, updated.getProgress().getOrDefault(99, 0));
    }
}
