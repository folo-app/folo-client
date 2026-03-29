package com.godten.folo.widget

import android.app.Application
import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.json.JSONArray
import org.json.JSONObject
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(application = Application::class, sdk = [35])
class GrowthWidgetStateRepositoryTest {
  private lateinit var context: Context
  private val repository = GrowthWidgetStateRepository()

  @Before
  fun setUp() {
    context = ApplicationProvider.getApplicationContext()
    sharedPreferences().edit().clear().commit()
  }

  @After
  fun tearDown() {
    sharedPreferences().edit().clear().commit()
  }

  @Test
  fun loadSnapshot_returnsPlaceholderWhenNothingStored() {
    val snapshot = repository.loadSnapshot(context)

    assertEquals(1, snapshot.schemaVersion)
    assertEquals(GrowthWidgetStatus.SETUP, snapshot.status)
    assertEquals(DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL, snapshot.deepLinkUrl)
    assertEquals("Start your streak", snapshot.footerCopy)
    assertEquals(GROWTH_WIDGET_CELL_COUNT, snapshot.cells.size)
    assertTrue(snapshot.cells.last().isToday)
  }

  @Test
  fun loadSnapshot_returnsStoredSnapshotWhenShapeIsValid() {
    sharedPreferences()
      .edit()
      .putString(
        GROWTH_WIDGET_SNAPSHOT_KEY,
        validSnapshotJson(
          status = "ACTIVE",
          currentStreak = 2,
          longestStreak = 5,
          footerCopy = "Keep growing",
          deepLinkUrl = "folo://widget/growth-streak?source=widget-growth",
        ).toString(),
      ).commit()

    val snapshot = repository.loadSnapshot(context)

    assertEquals(1, snapshot.schemaVersion)
    assertEquals(GrowthWidgetStatus.ACTIVE, snapshot.status)
    assertEquals(2, snapshot.currentStreak)
    assertEquals(5, snapshot.longestStreak)
    assertEquals("Keep growing", snapshot.footerCopy)
    assertEquals("folo://widget/growth-streak?source=widget-growth", snapshot.deepLinkUrl)
    assertEquals(0, snapshot.cells.first().level)
    assertEquals(4, snapshot.cells[4].level)
    assertTrue(snapshot.cells.last().isToday)
  }

  @Test
  fun loadSnapshot_fallsBackWhenSnapshotJsonIsMalformed() {
    sharedPreferences()
      .edit()
      .putString(GROWTH_WIDGET_SNAPSHOT_KEY, "{not-json")
      .commit()

    val snapshot = repository.loadSnapshot(context)

    assertEquals(GrowthWidgetStatus.SETUP, snapshot.status)
    assertEquals("Start your streak", snapshot.footerCopy)
    assertEquals(DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL, snapshot.deepLinkUrl)
  }

  @Test
  fun loadSnapshot_fallsBackWhenRequiredShapeIsIncomplete() {
    val invalidSnapshot =
      validSnapshotJson().apply {
        put("schemaVersion", 0)
        put("cells", JSONArray())
      }

    sharedPreferences()
      .edit()
      .putString(GROWTH_WIDGET_SNAPSHOT_KEY, invalidSnapshot.toString())
      .commit()

    val snapshot = repository.loadSnapshot(context)

    assertEquals(1, snapshot.schemaVersion)
    assertEquals(GrowthWidgetStatus.SETUP, snapshot.status)
    assertEquals(GROWTH_WIDGET_CELL_COUNT, snapshot.cells.size)
  }

  private fun validSnapshotJson(
    status: String = "IDLE",
    currentStreak: Int = 0,
    longestStreak: Int = 0,
    footerCopy: String = "Jump back in",
    deepLinkUrl: String = DEFAULT_GROWTH_WIDGET_DEEP_LINK_URL,
  ): JSONObject =
    JSONObject()
      .put("schemaVersion", 1)
      .put("generatedAt", "2026-03-29T00:00:00Z")
      .put("deepLinkUrl", deepLinkUrl)
      .put("title", "Growth Streak")
      .put("monthLabel", "March")
      .put("status", status)
      .put("currentStreak", currentStreak)
      .put("longestStreak", longestStreak)
      .put("footerCopy", footerCopy)
      .put("cells", validCellsJson())

  private fun validCellsJson(): JSONArray =
    JSONArray().apply {
      repeat(GROWTH_WIDGET_CELL_COUNT) { index ->
        put(
          JSONObject()
            .put("date", "2026-03-${(index + 1).toString().padStart(2, '0')}")
            .put("level", index)
            .put("isToday", index == GROWTH_WIDGET_CELL_COUNT - 1),
        )
      }
    }

  private fun sharedPreferences() =
    GrowthWidgetStorage.sharedPreferences(context)
}
