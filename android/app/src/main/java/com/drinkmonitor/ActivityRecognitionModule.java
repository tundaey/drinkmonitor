package com.drinkmonitor;

import android.support.annotation.Nullable;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.location.DetectedActivity;

import java.util.List;


public class ActivityRecognitionModule extends ReactContextBaseJavaModule {

  String IN_VEHICLE = "in_vehicle";
  String ON_BICYCLE = "on_bicycle";
  String ON_FOOT = "on_foot";
  String RUNNING = "running";
  String STILL = "still";
  String WALKING = "walking";
  String UNKNOWN = "unknown";

  public ActivityRecognitionModule(ReactApplicationContext reactContext) {
    super(reactContext);

  }

  public void getDetectedActivity(List<DetectedActivity> probableActivities){
    WritableMap params = Arguments.createMap();
    for( DetectedActivity activity : probableActivities ) {
      switch (activity.getType()) {
        case DetectedActivity.IN_VEHICLE: {
          Log.e("ActivityRecogition", "In Vehicle: " + activity.getConfidence());
          params.putDouble(IN_VEHICLE, activity.getConfidence());
          break;
        }
        case DetectedActivity.ON_BICYCLE: {
          Log.e("ActivityRecogition", "On Bicycle: " + activity.getConfidence());
          params.putDouble(ON_BICYCLE, activity.getConfidence());
          break;
        }
        case DetectedActivity.ON_FOOT: {
          Log.e("ActivityRecogition", "On Foot: " + activity.getConfidence());
          params.putDouble(ON_FOOT, activity.getConfidence());
          break;
        }
        case DetectedActivity.RUNNING: {
          Log.e("ActivityRecogition", "Running: " + activity.getConfidence());
          params.putDouble(RUNNING, activity.getConfidence());
          break;
        }
        case DetectedActivity.STILL: {
          Log.e("ActivityRecogition", "Still: " + activity.getConfidence());
          params.putDouble(STILL, activity.getConfidence());
          break;
        }
        case DetectedActivity.TILTING: {
          Log.e("ActivityRecogition", "Tilting: " + activity.getConfidence());
          break;
        }
        case DetectedActivity.WALKING: {
          Log.e("ActivityRecogition", "Walking: " + activity.getConfidence());
          params.putDouble(WALKING, activity.getConfidence());
        }
        case DetectedActivity.UNKNOWN: {
          Log.e("ActivityRecogition", "Unknown: " + activity.getConfidence());
          params.putDouble(UNKNOWN, activity.getConfidence());
          break;
        }
      }
    }

    sendEvent(getReactApplicationContext(), "getActivity", params);

    Toast.makeText(getReactApplicationContext(), "Activity Sent", Toast.LENGTH_LONG).show();
  }

  private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }


  @Override
  public String getName() {
    return "ActivityRecognitionModule";
  }

}