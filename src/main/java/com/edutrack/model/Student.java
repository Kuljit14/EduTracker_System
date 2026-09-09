package com.edutrack.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.util.*;

@Entity
@Table(name = "students")
public class Student {
    @Id
    private String id; // e.g. "STU-001"

    private String name;
    private String initials;
    private Integer attendance;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_enrollments", joinColumns = @JoinColumn(name = "student_id"))
    @OrderColumn(name = "enrollment_order")
    private List<Integer> enrollments = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_progress", joinColumns = @JoinColumn(name = "student_id"))
    @MapKeyColumn(name = "course_index")
    @Column(name = "progress_value")
    private Map<Integer, Integer> progress = new HashMap<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_schedule_overrides", joinColumns = @JoinColumn(name = "student_id"))
    @MapKeyColumn(name = "course_index")
    private Map<Integer, ScheduleOverride> scheduleOverrides = new HashMap<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "student_completions", joinColumns = @JoinColumn(name = "student_id"))
    private Set<CompletedTopic> completionSet = new HashSet<>();

    public Student() {
    }

    public Student(String id, String name, String initials, Integer attendance) {
        this.id = id;
        this.name = name;
        this.initials = initials;
        this.attendance = attendance;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
        if (name != null && !name.trim().isEmpty()) {
            String[] parts = name.trim().split("\\s+");
            if (parts.length >= 2) {
                this.initials = ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
            } else if (parts.length == 1) {
                this.initials = parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
            }
        }
    }

    public String getInitials() {
        return initials;
    }

    public void setInitials(String initials) {
        this.initials = initials;
    }

    public Integer getAttendance() {
        return attendance;
    }

    public void setAttendance(Integer attendance) {
        this.attendance = attendance;
    }

    public List<Integer> getEnrollments() {
        return enrollments;
    }

    public void setEnrollments(List<Integer> enrollments) {
        this.enrollments = enrollments;
    }

    public Map<Integer, Integer> getProgress() {
        return progress;
    }

    public void setProgress(Map<Integer, Integer> progress) {
        this.progress = progress;
    }

    public Map<Integer, ScheduleOverride> getScheduleOverrides() {
        return scheduleOverrides;
    }

    public void setScheduleOverrides(Map<Integer, ScheduleOverride> scheduleOverrides) {
        this.scheduleOverrides = scheduleOverrides;
    }

    public Set<CompletedTopic> getCompletionSet() {
        return completionSet;
    }

    public void setCompletionSet(Set<CompletedTopic> completionSet) {
        this.completionSet = completionSet;
    }

    @JsonProperty("completions")
    public Map<Integer, List<String>> getCompletions() {
        Map<Integer, List<String>> map = new HashMap<>();
        if (enrollments != null) {
            for (Integer enrolledCourse : enrollments) {
                map.put(enrolledCourse, new ArrayList<>());
            }
        }
        if (completionSet != null) {
            for (CompletedTopic ct : completionSet) {
                map.computeIfAbsent(ct.getCourseIndex(), k -> new ArrayList<>()).add(ct.getTopicName());
            }
        }
        return map;
    }

    @JsonProperty("completions")
    public void setCompletions(Map<Integer, List<String>> map) {
        if (map == null) return;
        if (this.completionSet == null) {
            this.completionSet = new HashSet<>();
        }
        this.completionSet.clear();
        for (Map.Entry<Integer, List<String>> entry : map.entrySet()) {
            if (entry.getValue() != null) {
                for (String topic : entry.getValue()) {
                    this.completionSet.add(new CompletedTopic(entry.getKey(), topic));
                }
            }
        }
    }

    public void addCompletion(Integer courseIndex, String topicName) {
        if (this.completionSet == null) {
            this.completionSet = new HashSet<>();
        }
        this.completionSet.add(new CompletedTopic(courseIndex, topicName));
    }
}
