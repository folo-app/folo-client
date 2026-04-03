package com.godten.folo.widget

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Calendar
import java.util.Date
import java.util.Locale
import java.util.TimeZone

internal const val WIDGET_SNAPSHOT_PREFERENCES_NAME = "folo_widget_snapshot_store"
internal const val GROWTH_WIDGET_SNAPSHOT_KEY = "growth_widget_snapshot"
internal const val NEXT_ROUTINE_WIDGET_SNAPSHOT_KEY = "next_routine_widget_snapshot"
internal const val GROWTH_WIDGET_CELL_COUNT = 35
internal const val DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL =
  "folo://widget/growth-streak?source=widget-growth"
internal const val DEFAULT_NEXT_ROUTINE_WIDGET_DEEP_LINK_URL =
  "folo://widget/next-routine?source=widget-routine"

internal object GrowthWidgetStorage {
  fun sharedPreferences(context: Context) =
    context.getSharedPreferences(WIDGET_SNAPSHOT_PREFERENCES_NAME, Context.MODE_PRIVATE)
}

internal class GrowthWidgetStateRepository {
  fun loadSnapshot(context: Context): GrowthWidgetSnapshot {
    val referenceDate = Date()
    val rawSnapshot =
      GrowthWidgetStorage
        .sharedPreferences(context)
        .getString(GROWTH_WIDGET_SNAPSHOT_KEY, null)
        ?: return GrowthWidgetSnapshot.placeholder(referenceDate)

    return runCatching {
      parseSnapshot(rawSnapshot, referenceDate)
    }.getOrElse {
      GrowthWidgetSnapshot.placeholder(referenceDate)
    }
  }

  fun loadNextRoutineSnapshot(context: Context): NextRoutineWidgetSnapshot {
    val referenceDate = Date()
    val rawSnapshot =
      GrowthWidgetStorage
        .sharedPreferences(context)
        .getString(NEXT_ROUTINE_WIDGET_SNAPSHOT_KEY, null)
        ?: return NextRoutineWidgetSnapshot.placeholder(referenceDate)

    return runCatching {
      parseNextRoutineSnapshot(rawSnapshot, referenceDate)
    }.getOrElse {
      NextRoutineWidgetSnapshot.placeholder(referenceDate)
    }
  }

  private fun parseSnapshot(
    rawSnapshot: String,
    referenceDate: Date,
  ): GrowthWidgetSnapshot {
    val json = JSONObject(rawSnapshot)
    val status =
      GrowthWidgetStatus.fromStorage(
        if (json.isNull("status")) null else json.optString("status"),
      )
    val cells = parseCells(json.optJSONArray("cells"), referenceDate)

    val snapshot =
      GrowthWidgetSnapshot(
        schemaVersion = json.optInt("schemaVersion", 0),
        generatedAt = json.optString("generatedAt", iso8601Formatter.format(referenceDate)),
        deepLinkUrl =
          json.optString(
            "deepLinkUrl",
            DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL,
          ),
        title = json.optString("title", "Growth Streak"),
        monthLabel = json.optString("monthLabel", monthFormatter.format(referenceDate)),
        status = status,
        currentStreak = json.optInt("currentStreak", 0).coerceAtLeast(0),
        longestStreak = json.optInt("longestStreak", 0).coerceAtLeast(0),
        footerCopy = json.optString("footerCopy", defaultFooterCopy(status)),
        cells = cells,
      )

    return if (snapshot.isRenderable) snapshot else GrowthWidgetSnapshot.placeholder(referenceDate)
  }

  private fun parseCells(
    cellsJson: JSONArray?,
    referenceDate: Date,
  ): List<GrowthWidgetCell> {
    if (cellsJson == null || cellsJson.length() != GROWTH_WIDGET_CELL_COUNT) {
      return GrowthWidgetSnapshot.placeholder(referenceDate).cells
    }

    return List(cellsJson.length()) { index ->
      val cellJson = cellsJson.optJSONObject(index) ?: JSONObject()

      GrowthWidgetCell(
        date = cellJson.optString("date", placeholderDate(index, referenceDate)),
        level = cellJson.optInt("level", 0).coerceIn(0, 4),
        isToday = cellJson.optBoolean("isToday", index == GROWTH_WIDGET_CELL_COUNT - 1),
      )
    }
  }

  private fun placeholderDate(
    index: Int,
    referenceDate: Date,
  ): String {
    val calendar =
      Calendar
        .getInstance()
        .apply {
          time = referenceDate
          add(Calendar.DAY_OF_YEAR, -(GROWTH_WIDGET_CELL_COUNT - 1) + index)
        }

    return dateFormatter.format(calendar.time)
  }

  private fun parseNextRoutineSnapshot(
    rawSnapshot: String,
    referenceDate: Date,
  ): NextRoutineWidgetSnapshot {
    val json = JSONObject(rawSnapshot)
    val status =
      NextRoutineWidgetStatus.fromStorage(
        if (json.isNull("status")) null else json.optString("status"),
      )
    val snapshot =
      NextRoutineWidgetSnapshot(
        schemaVersion = json.optInt("schemaVersion", 0),
        generatedAt = json.optString("generatedAt", iso8601Formatter.format(referenceDate)),
        deepLinkUrl =
          json.optString(
            "deepLinkUrl",
            DEFAULT_NEXT_ROUTINE_WIDGET_DEEP_LINK_URL,
          ),
        title = json.optString("title", "Next Routine"),
        status = status,
        headline = json.optString("headline", "루틴을 등록하세요"),
        subheadline =
          json.optString(
            "subheadline",
            "Creation Hub에서 일정과 금액을 정합니다",
          ),
        amountLabel =
          json.optString(
            "amountLabel",
            "다음 루틴이 위젯에 표시됩니다",
          ),
        footerCopy = json.optString("footerCopy", defaultRoutineFooterCopy(status)),
        activeCount = json.optInt("activeCount", 0).coerceAtLeast(0),
        dayOfMonth =
          if (json.isNull("dayOfMonth")) {
            null
          } else {
            json.optInt("dayOfMonth", 0).takeIf { it in 1..31 }
          },
      )

    return if (snapshot.isRenderable) snapshot else NextRoutineWidgetSnapshot.placeholder(referenceDate)
  }
}

internal enum class GrowthWidgetStatus {
  ACTIVE,
  IDLE,
  SETUP,
  ;

  companion object {
    fun fromStorage(value: String?): GrowthWidgetStatus =
      values().firstOrNull { it.name == value } ?: SETUP
  }
}

internal data class GrowthWidgetCell(
  val date: String,
  val level: Int,
  val isToday: Boolean,
)

internal data class GrowthWidgetSnapshot(
  val schemaVersion: Int,
  val generatedAt: String,
  val deepLinkUrl: String,
  val title: String,
  val monthLabel: String,
  val status: GrowthWidgetStatus,
  val currentStreak: Int,
  val longestStreak: Int,
  val footerCopy: String,
  val cells: List<GrowthWidgetCell>,
) {
  val isRenderable: Boolean
    get() = schemaVersion == 1 && cells.size == GROWTH_WIDGET_CELL_COUNT

  companion object {
    fun placeholder(referenceDate: Date = Date()): GrowthWidgetSnapshot {
      val calendar =
        Calendar
          .getInstance()
          .apply {
            time = referenceDate
            add(Calendar.DAY_OF_YEAR, -(GROWTH_WIDGET_CELL_COUNT - 1))
          }

      val cells =
        List(GROWTH_WIDGET_CELL_COUNT) { index ->
          val day = calendar.time

          if (index < GROWTH_WIDGET_CELL_COUNT - 1) {
            calendar.add(Calendar.DAY_OF_YEAR, 1)
          }

          GrowthWidgetCell(
            date = dateFormatter.format(day),
            level = 0,
            isToday = index == GROWTH_WIDGET_CELL_COUNT - 1,
          )
        }

      return GrowthWidgetSnapshot(
        schemaVersion = 1,
        generatedAt = iso8601Formatter.format(referenceDate),
        deepLinkUrl = DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL,
        title = "Growth Streak",
        monthLabel = monthFormatter.format(referenceDate),
        status = GrowthWidgetStatus.SETUP,
        currentStreak = 0,
        longestStreak = 0,
        footerCopy = defaultFooterCopy(GrowthWidgetStatus.SETUP),
        cells = cells,
      )
    }
  }
}

internal enum class NextRoutineWidgetStatus {
  ACTIVE,
  PAUSED,
  SETUP,
  ;

  companion object {
    fun fromStorage(value: String?): NextRoutineWidgetStatus =
      values().firstOrNull { it.name == value } ?: SETUP
  }
}

internal data class NextRoutineWidgetSnapshot(
  val schemaVersion: Int,
  val generatedAt: String,
  val deepLinkUrl: String,
  val title: String,
  val status: NextRoutineWidgetStatus,
  val headline: String,
  val subheadline: String,
  val amountLabel: String,
  val footerCopy: String,
  val activeCount: Int,
  val dayOfMonth: Int?,
) {
  val isRenderable: Boolean
    get() = schemaVersion == 1

  companion object {
    fun placeholder(referenceDate: Date = Date()): NextRoutineWidgetSnapshot =
      NextRoutineWidgetSnapshot(
        schemaVersion = 1,
        generatedAt = iso8601Formatter.format(referenceDate),
        deepLinkUrl = DEFAULT_NEXT_ROUTINE_WIDGET_DEEP_LINK_URL,
        title = "Next Routine",
        status = NextRoutineWidgetStatus.SETUP,
        headline = "루틴을 등록하세요",
        subheadline = "Creation Hub에서 일정과 금액을 정합니다",
        amountLabel = "다음 루틴이 위젯에 표시됩니다",
        footerCopy = defaultRoutineFooterCopy(NextRoutineWidgetStatus.SETUP),
        activeCount = 0,
        dayOfMonth = null,
      )
  }
}

internal fun defaultFooterCopy(status: GrowthWidgetStatus): String =
  when (status) {
    GrowthWidgetStatus.ACTIVE -> "Keep growing"
    GrowthWidgetStatus.IDLE -> "Jump back in"
    GrowthWidgetStatus.SETUP -> "Start your streak"
  }

internal fun defaultRoutineFooterCopy(status: NextRoutineWidgetStatus): String =
  when (status) {
    NextRoutineWidgetStatus.ACTIVE -> "다음 루틴을 확인하세요"
    NextRoutineWidgetStatus.PAUSED -> "루틴을 다시 켜 두세요"
    NextRoutineWidgetStatus.SETUP -> "First-class routine"
  }

private val monthFormatter =
  SimpleDateFormat("MMMM", Locale.US)

private val dateFormatter =
  SimpleDateFormat("yyyy-MM-dd", Locale.US)

private val iso8601Formatter =
  SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss'Z'", Locale.US).apply {
    timeZone = TimeZone.getTimeZone("UTC")
  }
