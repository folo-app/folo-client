package com.godten.folo.widget

import android.appwidget.AppWidgetManager
import android.content.Context
import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import org.json.JSONTokener

private const val MODULE_NAME = "WidgetSnapshotBridge"
private const val SHARED_PREFERENCES_NAME = "folo_widget_snapshot_store"
private const val GROWTH_SNAPSHOT_KEY = "growth_widget_snapshot"

class WidgetSnapshotBridgeModule(
  private val reactContext: ReactApplicationContext,
) : ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = MODULE_NAME

  @ReactMethod
  fun saveGrowthSnapshot(snapshotJson: String, promise: Promise) {
    try {
      validateSnapshotJson(snapshotJson)
      sharedPreferences()
        .edit()
        .putString(GROWTH_SNAPSHOT_KEY, snapshotJson)
        .apply()

      requestWidgetReload(reactContext)
      promise.resolve(null)
    } catch (exception: Exception) {
      promise.reject(
        "E_WIDGET_SNAPSHOT_SAVE_FAILED",
        "Failed to save the growth widget snapshot.",
        exception,
      )
    }
  }

  @ReactMethod
  fun clearGrowthSnapshot(promise: Promise) {
    try {
      sharedPreferences()
        .edit()
        .remove(GROWTH_SNAPSHOT_KEY)
        .apply()

      requestWidgetReload(reactContext)
      promise.resolve(null)
    } catch (exception: Exception) {
      promise.reject(
        "E_WIDGET_SNAPSHOT_CLEAR_FAILED",
        "Failed to clear the growth widget snapshot.",
        exception,
      )
    }
  }

  private fun sharedPreferences() =
    reactContext.getSharedPreferences(SHARED_PREFERENCES_NAME, Context.MODE_PRIVATE)

  private fun validateSnapshotJson(snapshotJson: String) {
    JSONTokener(snapshotJson).nextValue()
  }

  private fun requestWidgetReload(context: Context) {
    val appWidgetManager = AppWidgetManager.getInstance(context)
    val providers = appWidgetManager.installedProviders.filter {
      it.provider.packageName == context.packageName
    }

    providers.forEach { providerInfo ->
      val appWidgetIds = appWidgetManager.getAppWidgetIds(providerInfo.provider)

      if (appWidgetIds.isEmpty()) {
        return@forEach
      }

      val intent =
        Intent(AppWidgetManager.ACTION_APPWIDGET_UPDATE).apply {
          component = providerInfo.provider
          putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, appWidgetIds)
        }

      context.sendBroadcast(intent)
    }
  }
}
