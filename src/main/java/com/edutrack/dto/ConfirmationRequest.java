package com.edutrack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ConfirmationRequest {
    @NotBlank(message = "Student ID cannot be blank")
    @Size(max = 50, message = "Student ID must not exceed 50 characters")
    private String studentId;

    @NotBlank(message = "Student name cannot be blank")
    @Size(max = 100, message = "Student name must not exceed 100 characters")
    private String student;

    @NotNull(message = "Course index is required")
    @Min(value = 0, message = "Course index cannot be negative")
    private Integer courseIndex;

    @NotBlank(message = "Topic cannot be blank")
    @Size(max = 150, message = "Topic must not exceed 150 characters")
    private String topic;

    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String comment;

    @Size(max = 50, message = "Date must not exceed 50 characters")
    private String date;

    @Size(max = 50, message = "SubmittedAt must not exceed 50 characters")
    private String submittedAt;

    public ConfirmationRequest() {
    }

    public ConfirmationRequest(String studentId, String student, Integer courseIndex, String topic, String comment, String date, String submittedAt) {
        this.studentId = studentId;
        this.student = student;
        this.courseIndex = courseIndex;
        this.topic = topic;
        this.comment = comment;
        this.date = date;
        this.submittedAt = submittedAt;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudent() {
        return student;
    }

    public void setStudent(String student) {
        this.student = student;
    }

    public Integer getCourseIndex() {
        return courseIndex;
    }

    public void setCourseIndex(Integer courseIndex) {
        this.courseIndex = courseIndex;
    }

    public String getTopic() {
        return topic;
    }

    public void setTopic(String topic) {
        this.topic = topic;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }
}
