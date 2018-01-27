package com.drinkmonitor;

import android.app.IntentService;
import android.content.Intent;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.google.android.gms.location.ActivityRecognitionResult;
import com.google.android.gms.location.DetectedActivity;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.List;

public class ActivityRecognizedService extends IntentService {

    private static final String TAG = "Activity Recognition";

    public ActivityRecognizedService() {
        super("ActivityRecognizedService");
    }

    public ActivityRecognizedService(String name) {
        super(name);
    }

    @Override
    protected void onHandleIntent(Intent intent) {
        if(ActivityRecognitionResult.hasResult(intent)) {
            ActivityRecognitionResult result = ActivityRecognitionResult.extractResult(intent);
            //handleDetectedActivities( result.getProbableActivities() );
            List<DetectedActivity> detectedActivities = result.getProbableActivities();
            DetectedActivity detectedActivity = result.getMostProbableActivity();

            LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
            Intent customEvent= new Intent("my-custom-event");

            String data = "received";

            switch( detectedActivity.getType() ) {
                case DetectedActivity.IN_VEHICLE: {
                    Log.e( "ActivityRecogition", "In Vehicle: " + detectedActivity.getConfidence() );
                    String type = "In Vehicle";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);

                    break;
                }
                case DetectedActivity.ON_BICYCLE: {
                    Log.e( "ActivityRecogition", "On Bicycle: " + detectedActivity.getConfidence() );
                    String type = "On Bicycle";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
                case DetectedActivity.ON_FOOT: {
                    Log.e( "ActivityRecogition", "On Foot: " + detectedActivity.getConfidence() );
                    String type = "On Foot";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
                case DetectedActivity.RUNNING: {
                    Log.e( "ActivityRecogition", "Running: " + detectedActivity.getConfidence() );
                    String type = "Running";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
                case DetectedActivity.STILL: {
                    Log.e( "ActivityRecogition", "Still: " + detectedActivity.getConfidence() );
                    String type = "Still";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
                case DetectedActivity.TILTING: {
                    Log.e( "ActivityRecogition", "Tilting: " + detectedActivity.getConfidence() );
                    break;
                }
                case DetectedActivity.WALKING: {
                    Log.e( "ActivityRecogition", "Walking: " + detectedActivity.getConfidence() );
                    String type = "Walking";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
                case DetectedActivity.UNKNOWN: {
                    Log.e( "ActivityRecogition", "Unknown: " + detectedActivity.getConfidence() );
                    String type = "Unknown";
                    int confidence = detectedActivity.getConfidence();
                    broadCastEvent(type, confidence,detectedActivity,customEvent,localBroadcastManager);
                    break;
                }
            }
        }
    }

    private void broadCastEvent(String type, int confidence, DetectedActivity detectedActivity,
                                Intent customEvent, LocalBroadcastManager localBroadcastManager){
        DetectedAction action = new DetectedAction(type, detectedActivity.getConfidence());
        Gson gson = new Gson();
        Type actionType = new TypeToken<DetectedAction>() {}.getType();
        String json = gson.toJson(action, actionType);

        customEvent.putExtra("my-extra-data", json);
        localBroadcastManager.sendBroadcast(customEvent);
    }
}
