package com.edutrack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ScheduleOverrideRequest {
    @NotNull(message = "Course index is required")
    @Min(value = 0, message = "Course index cannot be negative")
    private Integer courseIndex;

    @NotBlank(message = "Day cannot be blank")
    @Size(max = 50, message = "Day must not exceed 50 characters")
    private String day;

    @NotBlank(message = "Time cannot be blank")
    @Size(max = 50, message = "Time must not exceed 50 characters")
    private String time;

    public ScheduleOverrideRequest() {
    }

    public ScheduleOverrideRequest(Integer courseIndex, String day, String time) {
        this.courseIndex = courseIndex;
        this.day = day;
        this.time = time;
    }

    public Integer getCourseIndex() {
        return courseIndex;
    }

    public void setCourseIndex(Integer courseIndex) {
        this.courseIndex = courseIndex;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
