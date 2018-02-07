package com.drinkmonitor;

import android.content.Intent;
import android.os.Bundle;
import android.support.annotation.Nullable;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.jstasks.HeadlessJsTaskConfig;

/**
 * Created by cex on 06/02/2018.
 */

public class TaskService extends HeadlessJsTaskService {

    @Override
    protected @Nullable HeadlessJsTaskConfig getTaskConfig(Intent intent) {
        Bundle extras = intent.getExtras();
        if (extras != null) {
            return new HeadlessJsTaskConfig(
                    "locationUpdates",
                    Arguments.fromBundle(extras),
                    0, // timeout for the task
                    false // optional: defines whether or not  the task is allowed in foreground. Default is false
            );
        }
        return null;
    }
}
