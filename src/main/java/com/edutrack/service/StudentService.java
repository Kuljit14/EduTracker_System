package com.edutrack.service;

import com.edutrack.dto.ScheduleOverrideRequest;
import com.edutrack.dto.StudentUpdateRequest;
import com.edutrack.model.ScheduleOverride;
import com.edutrack.model.Student;
import com.edutrack.repository.CourseRepository;
import com.edutrack.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class StudentService {

    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public StudentService(StudentRepository studentRepository, CourseRepository courseRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public List<Student> getAllStudents(String search, String courseFilter) {
        List<Student> list = studentRepository.findAll();

        if (search != null && !search.trim().isEmpty()) {
            String q = search.trim().toLowerCase();
            list = list.stream()
                    .filter(s -> s.getName().toLowerCase().contains(q))
                    .collect(Collectors.toList());
        }

        if (courseFilter != null && !courseFilter.trim().isEmpty() && !"All courses".equalsIgnoreCase(courseFilter.trim())) {
            var courseOpt = courseRepository.findAll().stream()
                    .filter(c -> c.getShortName() != null && c.getShortName().equalsIgnoreCase(courseFilter.trim()))
                    .findFirst();

            if (courseOpt.isPresent()) {
                Integer courseIndex = courseOpt.get().getId();
                list = list.stream()
                        .filter(s -> s.getEnrollments().contains(courseIndex))
                        .collect(Collectors.toList());
            }
        }

        return list;
    }

    public Optional<Student> getStudentById(String id) {
        return studentRepository.findById(id);
    }

    public Student createStudent(Student student) {
        if (student.getId() == null || student.getId().trim().isEmpty()) {
            long nextCount = studentRepository.count() + 1;
            student.setId(String.format("STU-%03d", nextCount));
        }
        if (student.getName() != null) {
            student.setName(student.getName().trim());
        }
        if (student.getAttendance() == null) {
            student.setAttendance(100);
        }
        return studentRepository.save(student);
    }

    public void deleteStudent(String id) {
        studentRepository.deleteById(id);
    }

    public Student updateStudent(String id, StudentUpdateRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            student.setName(req.getName().trim());
        }
        if (req.getAttendance() != null) {
            student.setAttendance(req.getAttendance());
        }
        if (req.getEnrollments() != null) {
            List<Integer> prevEnrollments = new ArrayList<>(student.getEnrollments());
            student.setEnrollments(req.getEnrollments());

            for (Integer enrolledCourse : req.getEnrollments()) {
                if (!prevEnrollments.contains(enrolledCourse)) {
                    student.getProgress().put(enrolledCourse, 0);
                }
            }

            for (Integer prevCourse : prevEnrollments) {
                if (!req.getEnrollments().contains(prevCourse)) {
                    student.getScheduleOverrides().remove(prevCourse);
                }
            }
        }

        return studentRepository.save(student);
    }

    public Student saveScheduleOverride(String id, ScheduleOverrideRequest req) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        student.getScheduleOverrides().put(
                req.getCourseIndex(),
                new ScheduleOverride(req.getDay(), req.getTime())
        );

        return studentRepository.save(student);
    }

    public Student clearScheduleOverride(String id, Integer courseIndex) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found with id: " + id));

        student.getScheduleOverrides().remove(courseIndex);
        return studentRepository.save(student);
    }
}
