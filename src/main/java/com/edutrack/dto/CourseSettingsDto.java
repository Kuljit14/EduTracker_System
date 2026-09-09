package com.edutrack.dto;

public class CourseSettingsDto {
    private String description;
    private String announcement;
    private String day;
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
