package com.drinkmonitor;

import android.app.Activity;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.hardware.Sensor;
import android.hardware.SensorManager;
import android.hardware.TriggerEvent;
import android.hardware.TriggerEventListener;
import android.location.Location;
import android.location.LocationListener;
import android.location.LocationManager;
import android.os.Bundle;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v4.app.ActivityCompat;
import android.support.v4.content.ContextCompat;
import android.support.v4.content.LocalBroadcastManager;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.common.ConnectionResult;
import com.google.android.gms.common.api.GoogleApiClient;
import com.google.android.gms.location.ActivityRecognition;
import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;
import com.google.android.gms.location.LocationSettingsRequest;

import java.util.HashMap;
import java.util.Map;


public class LocationAndSensorModule extends ReactContextBaseJavaModule implements ActivityEventListener,
        LifecycleEventListener,GoogleApiClient.ConnectionCallbacks, GoogleApiClient.OnConnectionFailedListener {

  private static final String DURATION_SHORT_KEY = "SHORT";
  private static final String DURATION_LONG_KEY = "LONG";
  private static final int MY_PERMISSION_ACCESS_FINE_LOCATION = 1;
  private static final int PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION = 1;
  private static final String E_FAILED_TO_SHOW_PICKER = "E_FAILED_TO_SHOW_PICKER";

  private static final long UPDATE_INTERVAL_IN_MILLISECONDS = 10000;
  private static final long FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS =
          UPDATE_INTERVAL_IN_MILLISECONDS / 2;

  private SensorManager mSensorManager;
  private Sensor mSensor;
  private TriggerEvent mTriggerEvent;
  private String mapEvent = "event";
  private String longitude = "longitude";
  private String latitude = "latitude";
  private FusedLocationProviderClient mFusedLocationClient;
  private LocationCallback mLocationCallback;
  private LocationSettingsRequest mLocationSettingsRequest;
  private Location mCurrentLocation;

  public boolean mLocationPermissionGranted;


  @Override
  public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
    Log.e("getLocation"," Activity Came Back ");
  }

  @Override
  public void onNewIntent(Intent intent) {
    Log.e("getLocation"," Activity onNewIntent");
  }


  public GoogleApiClient mApiClient;

  private ReactContext mReactContext;
  // instance of our receiver
  private LocalBroadcastReceiver  mLocalBroadcastReceiver;
  private LocationRequest mLocationRequest;

  Intent intent;
  PendingIntent pendingIntent;

  public LocationAndSensorModule(ReactApplicationContext reactContext) {

    super(reactContext);
    // Add the listener for `onActivityResult`
    //reactContext.addActivityEventListener(mActivityEventListener);
    reactContext.addActivityEventListener(this);

    reactContext.addLifecycleEventListener(this);



    this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(reactContext);
    localBroadcastManager.registerReceiver(mLocalBroadcastReceiver, new IntentFilter("my-custom-event"));

    mSensorManager = (SensorManager) reactContext.getSystemService(reactContext.SENSOR_SERVICE);
    mSensor = mSensorManager.getDefaultSensor(Sensor.TYPE_SIGNIFICANT_MOTION);

    mApiClient = new GoogleApiClient.Builder(getReactApplicationContext())
            .addApi(ActivityRecognition.API)
            .addConnectionCallbacks(this)
            .addOnConnectionFailedListener(this)
            .build();

    mApiClient.connect();
    mFusedLocationClient = LocationServices.getFusedLocationProviderClient(reactContext);

    createLocationCallback();
    createLocationRequest();
    buildLocationSettingsRequest();

  }



  public class LocalBroadcastReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
      Toast.makeText(getReactApplicationContext(), "Receiving Data", Toast.LENGTH_LONG).show();
      String someData = intent.getStringExtra("my-extra-data");
      getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
              .emit("JS-Event", someData);
    }
  }


  @Override
  public void onConnected(@Nullable Bundle bundle) {
    intent = new Intent(getReactApplicationContext(), ActivityRecognizedService.class );
    pendingIntent = PendingIntent.getService( getReactApplicationContext(), 0, intent, PendingIntent.FLAG_UPDATE_CURRENT );
    //ActivityRecognition.ActivityRecognitionApi.requestActivityUpdates( mApiClient, 120000, pendingIntent );

  }


  @Override
  public void onConnectionSuspended(int i) {

  }

  @Override
  public void onConnectionFailed(@NonNull ConnectionResult connectionResult) {

  }



  private void sendEvent(ReactContext reactContext, String eventName, @Nullable WritableMap params) {
    reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
            .emit(eventName, params);
  }

  private TriggerEventListener mTriggerEventListener = new TriggerEventListener() {
    @Override
    public void onTrigger(TriggerEvent event) {
      // Do work
      mTriggerEvent = event;
      int timestamp = (int) event.timestamp;

      WritableMap params = Arguments.createMap();
      params.putInt(mapEvent, timestamp);
      sendEvent(getReactApplicationContext(), "onTrigger", params);

      Toast.makeText(getReactApplicationContext(), "Significant motion detected",
              Toast.LENGTH_LONG).show();

      ActivityRecognition.ActivityRecognitionApi
              .requestActivityUpdates( mApiClient, 120000, pendingIntent );


    }
  };

  // Acquire a reference to the system Location Manager
  private LocationManager locationManager = (LocationManager) getReactApplicationContext()
          .getSystemService(getReactApplicationContext().LOCATION_SERVICE);

  // Define a listener that responds to location updates
  private LocationListener locationListener = new LocationListener() {
    public void onLocationChanged(Location location) {
      // Called when a new location is found by the network location provider.
      //makeUseOfNewLocation(location);
      Log.e( "getLocation", "Longitude " + location.getLongitude()  );
      Log.e( "getLocation", "Latitude " + location.getLatitude()  );
      WritableMap params = Arguments.createMap();
      params.putDouble(longitude, location.getLongitude());
      params.putDouble(latitude, location.getLatitude());
      sendEvent(getReactApplicationContext(), "pushLocation", params);
    }

    public void onStatusChanged(String provider, int status, Bundle extras) {}

    public void onProviderEnabled(String provider) {}

    public void onProviderDisabled(String provider) {}
  };

  @ReactMethod
  private void startReceiver(){
    IntentFilter filter = new IntentFilter(Intent.ACTION_SCREEN_ON);
    filter.addAction(Intent.ACTION_SCREEN_OFF);
    BroadcastReceiver networkReceiver = new NetworkChangeReceiver();
    getCurrentActivity().registerReceiver(networkReceiver, filter);
  }


  @ReactMethod
  private void getDistanceBetweenLocations(
          Double longitude1, Double latitude1, Double longitude2, Double latitude2, Callback callback){

    Location locationA = new Location("point A");
    locationA.setLatitude(latitude1);
    locationA.setLongitude(longitude1);

    Location locationB = new Location("point B");

    locationB.setLatitude(latitude2);
    locationB.setLongitude(longitude2);

    float distance = locationA.distanceTo(locationB);
    callback.invoke(distance);
  }

  @ReactMethod
  private void stopSamplingLocation(){
    //stopLocationUpdates();
    //locationManager.removeUpdates(locationListener);
    Intent intent = new Intent(getReactApplicationContext(), ActivityRecognizedService.class );
    PendingIntent pendingIntent = PendingIntent.getService( getReactApplicationContext(), 0, intent, PendingIntent.FLAG_UPDATE_CURRENT );

    ActivityRecognition.ActivityRecognitionApi.removeActivityUpdates(mApiClient, pendingIntent);
    Toast.makeText(getReactApplicationContext(), "Removed Activity Updates", Toast.LENGTH_LONG).show();
  }

  @ReactMethod
  private void getPermission(){
    try {
      ReactApplicationContext context = getReactApplicationContext();
      Intent intent = new Intent(context, PermissionActivity.class);
      context.startActivityForResult(intent, PERMISSIONS_REQUEST_ACCESS_FINE_LOCATION, null);

    } catch (Exception e) {

    }
  }

  private void buildLocationSettingsRequest() {
    LocationSettingsRequest.Builder builder = new LocationSettingsRequest.Builder();
    builder.addLocationRequest(mLocationRequest);
    mLocationSettingsRequest = builder.build();
  }

  private void createLocationRequest() {
    mLocationRequest = new LocationRequest();
    mLocationRequest.setInterval(UPDATE_INTERVAL_IN_MILLISECONDS);

    mLocationRequest.setFastestInterval(FASTEST_UPDATE_INTERVAL_IN_MILLISECONDS);

    mLocationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
  }

  private void createLocationCallback() {
    mLocationCallback = new LocationCallback() {
      @Override
      public void onLocationResult(LocationResult locationResult) {
        super.onLocationResult(locationResult);

        mCurrentLocation = locationResult.getLastLocation();
        Log.e( "getLocation", "Current location" + mCurrentLocation  );
        //mLastUpdateTime = DateFormat.getTimeInstance().format(new Date());
        //updateLocationUI();
      }
    };
  }


  private void startLocationUpdates() {
    if ( ContextCompat.checkSelfPermission( getReactApplicationContext(), android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ) {
      Log.e( "getLocation", "Request Permission "  );
      ActivityCompat.requestPermissions( getReactApplicationContext().getCurrentActivity(), new String[] {
              android.Manifest.permission.ACCESS_FINE_LOCATION  },MY_PERMISSION_ACCESS_FINE_LOCATION );
      Log.e( "getLocation", "Permission Requested"  );
    }

    mFusedLocationClient.requestLocationUpdates(mLocationRequest, mLocationCallback, null /* Looper */);
    Log.e( "getLocation", "Permission Granted"  );
  }

  private void stopLocationUpdates() {
    mFusedLocationClient.removeLocationUpdates(mLocationCallback);
  }

  @ReactMethod
  private void getLocation(){

    Log.e( "getLocation", "Reached Gotten Permission: "  );
    if ( ContextCompat.checkSelfPermission( getReactApplicationContext(), android.Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED ) {
      Log.e( "getLocation", "Request Permission "  );
      ActivityCompat.requestPermissions( getReactApplicationContext().getCurrentActivity(), new String[] {
              android.Manifest.permission.ACCESS_FINE_LOCATION  },MY_PERMISSION_ACCESS_FINE_LOCATION );
      Log.e( "getLocation", "Permission Requested"  );
    }
    Log.e( "getLocation", "Permission Granted"  );
    locationManager.requestLocationUpdates(LocationManager.NETWORK_PROVIDER, 60000, 0, locationListener);
  }



  @Override
  public void onHostResume() {
    mSensorManager.requestTriggerSensor(mTriggerEventListener, mSensor);
  }

  @Override
  public void onHostPause() {
    // Call disable to ensure that the trigger request has been canceled.
    //mSensorManager.cancelTriggerSensor(mTriggerEventListener, mSensor);
  }

  @Override
  public void onHostDestroy() {
    // Call disable to ensure that the trigger request has been canceled.
    //mSensorManager.cancelTriggerSensor(mTriggerEventListener, mSensor);
  }

  @Override
  public String getName() {
    return "LocationAndSensorModule";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put(DURATION_SHORT_KEY, Toast.LENGTH_SHORT);
    constants.put(DURATION_LONG_KEY, Toast.LENGTH_LONG);
    return constants;
  }

  @ReactMethod
  public void show(String message, int duration) {
    Toast.makeText(getReactApplicationContext(), message, duration).show();
  }
}