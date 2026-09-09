package com.edutrack.dto;

public class ConfirmationRequest {
    private String studentId;
    private String student;
    private Integer courseIndex;
    private String topic;
    private String comment;
    private String date;
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
