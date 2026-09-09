package com.edutrack.dto;

public class ReorderTopicRequest {
    private int fromIndex;
    private int direction; // -1 for move up, 1 for move down

    public ReorderTopicRequest() {
    }

    public ReorderTopicRequest(int fromIndex, int direction) {
        this.fromIndex = fromIndex;
        this.direction = direction;
    }

    public int getFromIndex() {
        return fromIndex;
    }

    public void setFromIndex(int fromIndex) {
        this.fromIndex = fromIndex;
    }

    public int getDirection() {
        return direction;
    }

    public void setDirection(int direction) {
        this.direction = direction;
    }
}
