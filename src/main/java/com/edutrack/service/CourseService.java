package com.edutrack.service;

import com.edutrack.dto.CourseSettingsDto;
import com.edutrack.dto.TopicRequest;
import com.edutrack.model.Course;
import com.edutrack.model.Topic;
import com.edutrack.repository.CourseRepository;
import com.edutrack.repository.StudentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CourseService {

    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;

    public CourseService(CourseRepository courseRepository, StudentRepository studentRepository) {
        this.courseRepository = courseRepository;
        this.studentRepository = studentRepository;
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Optional<Course> getCourseById(Integer id) {
        return courseRepository.findById(id);
    }

    public Course createCourse(Course course) {
        if (course.getId() == null) {
            int nextId = 0;
            List<Course> all = courseRepository.findAll();
            for (Course c : all) {
                if (c.getId() >= nextId) {
                    nextId = c.getId() + 1;
                }
            }
            course.setId(nextId);
        }
        if (course.getProgress() == null) {
            course.setProgress(0);
        }
        return courseRepository.save(course);
    }

    public void deleteCourse(Integer id) {
        courseRepository.deleteById(id);
    }

    public Course updateCourseSettings(Integer id, CourseSettingsDto settings) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        if (settings.getDescription() != null) {
            course.setDescription(settings.getDescription());
        }
        if (settings.getAnnouncement() != null) {
            course.setAnnouncement(settings.getAnnouncement());
        }
        if (settings.getDay() != null) {
            course.setDay(settings.getDay());
        }
        if (settings.getTime() != null) {
            course.setTime(settings.getTime());
        }

        return courseRepository.save(course);
    }

    public Course addTopic(Integer id, TopicRequest req) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        if ("current".equalsIgnoreCase(req.getStatus())) {
            for (Topic t : course.getTopics()) {
                if ("current".equalsIgnoreCase(t.getStatus())) {
                    t.setStatus("upcoming");
                }
            }
        }

        course.getTopics().add(new Topic(req.getName(), req.getDescription(), req.getStatus()));
        return courseRepository.save(course);
    }

    public Course updateTopic(Integer id, int topicIndex, String name, String description) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        if (topicIndex >= 0 && topicIndex < course.getTopics().size()) {
            Topic topic = course.getTopics().get(topicIndex);
            if (name != null && !name.trim().isEmpty()) {
                topic.setName(name.trim());
            }
            if (description != null) {
                topic.setDescription(description.trim());
            }
            return courseRepository.save(course);
        }
        throw new IndexOutOfBoundsException("Invalid topic index: " + topicIndex);
    }

    public Course setTopicCurrent(Integer id, int topicIndex) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        List<Topic> topics = course.getTopics();
        for (int i = 0; i < topics.size(); i++) {
            Topic t = topics.get(i);
            if ("current".equalsIgnoreCase(t.getStatus())) {
                t.setStatus("upcoming");
            }
            if (i == topicIndex) {
                t.setStatus("current");
            }
        }
        return courseRepository.save(course);
    }

    public Course reorderTopic(Integer id, int fromIndex, int direction) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        List<Topic> topics = course.getTopics();
        int toIndex = fromIndex + direction;
        if (fromIndex >= 0 && fromIndex < topics.size() && toIndex >= 0 && toIndex < topics.size()) {
            Topic temp = topics.get(fromIndex);
            topics.set(fromIndex, topics.get(toIndex));
            topics.set(toIndex, temp);
            return courseRepository.save(course);
        }
        return course;
    }

    public Course deleteTopic(Integer id, int topicIndex) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Course not found with id: " + id));

        if (topicIndex >= 0 && topicIndex < course.getTopics().size()) {
            course.getTopics().remove(topicIndex);
            return courseRepository.save(course);
        }
        throw new IndexOutOfBoundsException("Invalid topic index: " + topicIndex);
    }

    public void enrollStudents(Integer courseId, List<String> studentIds) {
        for (String studentId : studentIds) {
            studentRepository.findById(studentId).ifPresent(student -> {
                if (!student.getEnrollments().contains(courseId)) {
                    student.getEnrollments().add(courseId);
                    student.getProgress().put(courseId, 0);
                    studentRepository.save(student);
                }
            });
        }
    }

    public void unenrollStudents(Integer courseId, List<String> studentIds) {
        for (String studentId : studentIds) {
            studentRepository.findById(studentId).ifPresent(student -> {
                student.getEnrollments().remove(courseId);
                student.getScheduleOverrides().remove(courseId);
                studentRepository.save(student);
            });
        }
    }
}
