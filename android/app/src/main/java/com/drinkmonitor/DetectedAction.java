package com.drinkmonitor;

import com.google.gson.annotations.SerializedName;

import java.io.Serializable;

/**
 * Created by Tundaey on 20-Jan-18.
 */

public class DetectedAction implements Serializable {
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    @SerializedName("type")
    private String type;

    public int getConfidence() {
        return confidence;
    }

    public void setConfidence(int confidence) {
        this.confidence = confidence;
    }

    @SerializedName("confidence")
    private int confidence;

    public DetectedAction(String type, int confidence){
        this.type = type;
        this.confidence = confidence;
    }
}
