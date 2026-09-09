package com.edutrack.dto;

public class ScheduleOverrideRequest {
    private Integer courseIndex;
    private String day;
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
