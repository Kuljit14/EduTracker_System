package com.edutrack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

public class StudentUpdateRequest {
    @NotBlank(message = "Student name cannot be blank")
    @Size(max = 100, message = "Student name must not exceed 100 characters")
    private String name;

    @Min(value = 0, message = "Attendance cannot be less than 0")
    @Max(value = 100, message = "Attendance cannot exceed 100")
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
