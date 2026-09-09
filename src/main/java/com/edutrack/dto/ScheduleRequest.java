package com.edutrack.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ScheduleRequest {
    @Size(max = 50, message = "ID must not exceed 50 characters")
    private String id;

    @NotNull(message = "Course index is required")
    @Min(value = 0, message = "Course index cannot be negative")
    private Integer courseIndex;

    @NotBlank(message = "Topic cannot be blank")
    @Size(max = 150, message = "Topic must not exceed 150 characters")
    private String topic;

    @NotBlank(message = "Date cannot be blank")
    @Size(max = 50, message = "Date must not exceed 50 characters")
    private String date;

    @NotBlank(message = "Time cannot be blank")
    @Size(max = 50, message = "Time must not exceed 50 characters")
    private String time;

    public ScheduleRequest() {
    }

    public ScheduleRequest(String id, Integer courseIndex, String topic, String date, String time) {
        this.id = id;
        this.courseIndex = courseIndex;
        this.topic = topic;
        this.date = date;
        this.time = time;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
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

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }
}
