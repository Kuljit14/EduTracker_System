package com.edutrack.model;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {
    @Id
    private Integer id; // 0, 1, 2, 3 matching the course indices

    private String name;
    private String shortName;
    private String meta;
    private Integer progress;

    @Column(length = 1000)
    private String description;

    @Column(length = 1000)
    private String announcement;

    private String day;
    private String time;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_topics", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "topic_order")
    private List<Topic> topics = new ArrayList<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "course_learning_points", joinColumns = @JoinColumn(name = "course_id"))
    @OrderColumn(name = "point_order")
    private List<String> learningPoints = new ArrayList<>();

    public Course() {
    }

    public Course(Integer id, String name, String shortName, String meta, Integer progress,
                  String description, String announcement, String day, String time) {
        this.id = id;
        this.name = name;
        this.shortName = shortName;
        this.meta = meta;
        this.progress = progress;
        this.description = description;
        this.announcement = announcement;
        this.day = day;
        this.time = time;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getShortName() {
        return shortName;
    }

    public void setShortName(String shortName) {
        this.shortName = shortName;
    }

    public String getMeta() {
        return meta;
    }

    public void setMeta(String meta) {
        this.meta = meta;
    }

    public Integer getProgress() {
        return progress;
    }

    public void setProgress(Integer progress) {
        this.progress = progress;
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

    public List<Topic> getTopics() {
        return topics;
    }

    public void setTopics(List<Topic> topics) {
        this.topics = topics;
    }

    public List<String> getLearningPoints() {
        return learningPoints;
    }

    public void setLearningPoints(List<String> learningPoints) {
        this.learningPoints = learningPoints;
    }
}
