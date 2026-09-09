package com.edutrack.dto;

import java.util.List;

public class EnrollmentRequest {
    private List<String> studentIds;

    public EnrollmentRequest() {
    }

    public EnrollmentRequest(List<String> studentIds) {
        this.studentIds = studentIds;
    }

    public List<String> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<String> studentIds) {
        this.studentIds = studentIds;
    }
}
