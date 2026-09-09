package com.edutrack.dto;

import java.util.List;

public class StudentUpdateRequest {
    private String name;
    private Integer attendance;
    private List<Integer> enrollments;

    public StudentUpdateRequest() {
    }

    public StudentUpdateRequest(String name, Integer attendance, List<Integer> enrollments) {
        this.name = name;
        this.attendance = attendance;
        this.enrollments = enrollments;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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
}
