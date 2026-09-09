package com.edutrack.controller;

import com.edutrack.dto.CourseSettingsDto;
import com.edutrack.dto.EnrollmentRequest;
import com.edutrack.dto.ReorderTopicRequest;
import com.edutrack.dto.TopicRequest;
import com.edutrack.model.Course;
import com.edutrack.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Course> getCourseById(@PathVariable Integer id) {
        return courseService.getCourseById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Integer id) {
        courseService.deleteCourse(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/settings")
    public ResponseEntity<Course> updateCourseSettings(@PathVariable Integer id, @RequestBody @Valid CourseSettingsDto settings) {
        return ResponseEntity.ok(courseService.updateCourseSettings(id, settings));
    }

    @PostMapping("/{id}/topics")
    public ResponseEntity<Course> addTopic(@PathVariable Integer id, @RequestBody @Valid TopicRequest req) {
        return ResponseEntity.ok(courseService.addTopic(id, req));
    }

    @PutMapping("/{id}/topics/{topicIndex}")
    public ResponseEntity<Course> updateTopic(
            @PathVariable Integer id,
            @PathVariable int topicIndex,
            @RequestBody @Valid TopicRequest req) {
        return ResponseEntity.ok(courseService.updateTopic(id, topicIndex, req.getName(), req.getDescription()));
    }

    @PutMapping("/{id}/topics/{topicIndex}/current")
    public ResponseEntity<Course> setTopicCurrent(@PathVariable Integer id, @PathVariable int topicIndex) {
        return ResponseEntity.ok(courseService.setTopicCurrent(id, topicIndex));
    }

    @PutMapping("/{id}/topics/reorder")
    public ResponseEntity<Course> reorderTopic(@PathVariable Integer id, @RequestBody @Valid ReorderTopicRequest req) {
        return ResponseEntity.ok(courseService.reorderTopic(id, req.getFromIndex(), req.getDirection()));
    }

    @DeleteMapping("/{id}/topics/{topicIndex}")
    public ResponseEntity<Course> deleteTopic(@PathVariable Integer id, @PathVariable int topicIndex) {
        return ResponseEntity.ok(courseService.deleteTopic(id, topicIndex));
    }

    @PostMapping("/{id}/enroll")
    public ResponseEntity<Void> enrollStudents(@PathVariable Integer id, @RequestBody EnrollmentRequest req) {
        if (req.getStudentIds() != null) {
            courseService.enrollStudents(id, req.getStudentIds());
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/unenroll")
    public ResponseEntity<Void> unenrollStudents(@PathVariable Integer id, @RequestBody EnrollmentRequest req) {
        if (req.getStudentIds() != null) {
            courseService.unenrollStudents(id, req.getStudentIds());
        }
        return ResponseEntity.ok().build();
    }
}
