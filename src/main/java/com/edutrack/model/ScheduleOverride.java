package com.edutrack.model;

import jakarta.persistence.Embeddable;

@Embeddable
public class ScheduleOverride {
    private String day;
    private String time;

    public ScheduleOverride() {
    }

    public ScheduleOverride(String day, String time) {
        this.day = day;
        this.time = time;
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
