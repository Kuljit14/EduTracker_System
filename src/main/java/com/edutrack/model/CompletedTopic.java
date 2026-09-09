package com.edutrack.model;

import jakarta.persistence.Embeddable;
import java.util.Objects;

@Embeddable
public class CompletedTopic {
    private Integer courseIndex;
    private String topicName;

    public CompletedTopic() {
    }

    public CompletedTopic(Integer courseIndex, String topicName) {
        this.courseIndex = courseIndex;
        this.topicName = topicName;
    }

    public Integer getCourseIndex() {
        return courseIndex;
    }

    public void setCourseIndex(Integer courseIndex) {
        this.courseIndex = courseIndex;
    }

    public String getTopicName() {
        return topicName;
    }

    public void setTopicName(String topicName) {
        this.topicName = topicName;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CompletedTopic that = (CompletedTopic) o;
        return Objects.equals(courseIndex, that.courseIndex) && Objects.equals(topicName, that.topicName);
    }

    @Override
    public int hashCode() {
        return Objects.hash(courseIndex, topicName);
    }
}
