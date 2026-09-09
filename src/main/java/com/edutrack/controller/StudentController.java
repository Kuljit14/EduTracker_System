package com.edutrack.controller;

import com.edutrack.dto.ScheduleOverrideRequest;
import com.edutrack.dto.StudentUpdateRequest;
import com.edutrack.model.Student;
import com.edutrack.service.StudentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String courseFilter) {
        return ResponseEntity.ok(studentService.getAllStudents(search, courseFilter));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable String id) {
        return studentService.getStudentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.ok(studentService.createStudent(student));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(
            @PathVariable String id,
            @RequestBody @Valid StudentUpdateRequest req) {
        return ResponseEntity.ok(studentService.updateStudent(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/override")
    public ResponseEntity<Student> saveScheduleOverride(
            @PathVariable String id,
            @RequestBody @Valid ScheduleOverrideRequest req) {
        return ResponseEntity.ok(studentService.saveScheduleOverride(id, req));
    }

    @DeleteMapping("/{id}/override/{courseIndex}")
    public ResponseEntity<Student> clearScheduleOverride(
            @PathVariable String id,
            @PathVariable Integer courseIndex) {
        return ResponseEntity.ok(studentService.clearScheduleOverride(id, courseIndex));
    }
}
