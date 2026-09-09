package com.edutrack.dto;

import jakarta.validation.constraints.Size;

public class CourseSettingsDto {
    @Size(max = 1000, message = "Description must not exceed 1000 characters")
    private String description;

    @Size(max = 1000, message = "Announcement must not exceed 1000 characters")
    private String announcement;

    @Size(max = 50, message = "Day must not exceed 50 characters")
    private String day;

    @Size(max = 50, message = "Time must not exceed 50 characters")
    private String time;

    public CourseSettingsDto() {
    }

    public CourseSettingsDto(String description, String announcement, String day, String time) {
        this.description = description;
        this.announcement = announcement;
        this.day = day;
        this.time = time;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAnnouncement() {
        return announcement;
    }

    public void setAnnouncement(String announcement) {
        this.announcement = announcement;
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
