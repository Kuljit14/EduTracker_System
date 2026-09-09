package com.edutrack.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "class_schedules")
public class ClassSchedule {
    @Id
    private String id;
    private Integer courseIndex;
    private String topic;
    private String date;
    private String time;

    public ClassSchedule() {
    }

    public ClassSchedule(String id, Integer courseIndex, String topic, String date, String time) {
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
