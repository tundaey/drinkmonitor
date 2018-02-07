package com.drinkmonitor;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.location.Location;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

/**
 * Created by cex on 05/02/2018.
 */

public class GeolocationModule extends ReactContextBaseJavaModule {

    public GeolocationModule(ReactApplicationContext reactContext) {
        super(reactContext);
        BroadcastReceiver geoLocationReceiver = new BroadcastReceiver() {
            @Override
            public void onReceive(Context context, Intent intent) {
                Log.e( "Geolocation", "location received" );
                Location message = intent.getParcelableExtra("message");
                GeolocationModule.this.sendEvent(message);
            }
        };
        LocalBroadcastManager.getInstance(getReactApplicationContext()).registerReceiver(geoLocationReceiver, new IntentFilter("GeoLocationUpdate"));
    }

    @Override
    public String getName() {
        return "GeoLocation";
    }

    @ReactMethod
    public void startService(Promise promise) {
        String result = "Success";
        Log.e( "Geolocation", "start service reached" );
        try {
            Intent intent = new Intent(GeolocationService.FOREGROUND);
            intent.setClass(this.getReactApplicationContext(), GeolocationService.class);
            getReactApplicationContext().startService(intent);
            Log.e( "Geolocation", "start service called" );
        } catch (Exception e) {
            promise.reject(e);
            Log.e( "Geolocation", "start service rejected" );
            return;
        }
        promise.resolve(result);
        Log.e( "Geolocation", "start service promise resolved" );
    }

    @ReactMethod
    public void startBackgroundService(Promise promise) {
        String result = "Success";
        Log.e( "Geolocation", "start service reached" );
        try {
            Intent intent = new Intent(BackgroundGeolocationService.);
            intent.setClass(this.getReactApplicationContext(), BackgroundGeolocationService.class);
            getReactApplicationContext().startService(intent);
            Log.e( "Geolocation", "start service called" );
        } catch (Exception e) {
            promise.reject(e);
            Log.e( "Geolocation", "start service rejected" );
            return;
        }
        promise.resolve(result);
        Log.e( "Geolocation", "start service promise resolved" );
    }

    @ReactMethod
    public void stopService(Promise promise) {
        String result = "Success";
        try {
            Intent intent = new Intent(GeolocationService.FOREGROUND);
            intent.setClass(this.getReactApplicationContext(), GeolocationService.class);
            this.getReactApplicationContext().stopService(intent);
        } catch (Exception e) {
            promise.reject(e);
            return;
        }
        promise.resolve(result);
    }

    private void sendEvent(Location message) {
        WritableMap map = Arguments.createMap();
        WritableMap coordMap = Arguments.createMap();
        coordMap.putDouble("latitude", message.getLatitude());
        coordMap.putDouble("longitude", message.getLongitude());
        coordMap.putDouble("accuracy", message.getAccuracy());
        coordMap.putDouble("altitude", message.getAltitude());
        coordMap.putDouble("heading", message.getBearing());
        coordMap.putDouble("speed", message.getSpeed());

        map.putMap("coords", coordMap);
        map.putDouble("timestamp", message.getTime());

        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("updateLocation", map);
    }
}


