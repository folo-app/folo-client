package com.godten.folo.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.GlanceId
import androidx.glance.GlanceModifier
import androidx.glance.ImageProvider
import androidx.glance.LocalSize
import androidx.glance.action.Action
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.appWidgetBackground
import androidx.glance.appwidget.cornerRadius
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.Alignment
import androidx.glance.layout.Box
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.size
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.godten.folo.MainActivity
import com.godten.folo.R

internal class GrowthWidget : GlanceAppWidget() {
  private val stateRepository = GrowthWidgetStateRepository()

  override val sizeMode: SizeMode =
    SizeMode.Responsive(
      setOf(
        DpSize(170.dp, 170.dp),
        DpSize(244.dp, 170.dp),
      ),
    )

  override suspend fun provideGlance(
    context: Context,
    id: GlanceId,
  ) {
    val snapshot = stateRepository.loadSnapshot(context)
    val openPortfolioAction = actionStartActivity(buildGrowthWidgetIntent(context, snapshot))

    provideContent {
      GrowthWidgetContent(
        snapshot = snapshot,
        openPortfolioAction = openPortfolioAction,
      )
    }
  }
}

@Composable
private fun GrowthWidgetContent(
  snapshot: GrowthWidgetSnapshot,
  openPortfolioAction: Action,
) {
  val size = LocalSize.current
  val isMedium = size.width >= 220.dp

  Column(
    modifier =
      GlanceModifier
        .fillMaxSize()
        .appWidgetBackground()
        .background(ImageProvider(R.drawable.widget_background))
        .cornerRadius(24.dp)
        .clickable(openPortfolioAction)
        .padding(16.dp),
  ) {
    if (isMedium) {
      GrowthWidgetMediumContent(snapshot = snapshot)
    } else {
      GrowthWidgetSmallContent(snapshot = snapshot)
    }
  }
}

@Composable
private fun GrowthWidgetSmallContent(snapshot: GrowthWidgetSnapshot) {
  Column(
    modifier = GlanceModifier.fillMaxSize(),
  ) {
    Row(
      modifier = GlanceModifier.fillMaxWidth(),
      verticalAlignment = Alignment.CenterVertically,
    ) {
      Text(
        text = snapshot.title,
        maxLines = 1,
        style =
          TextStyle(
            color = GrowthWidgetPalette.textStrong,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
          ),
      )

      Spacer(modifier = GlanceModifier.width(8.dp))

      Text(
        text = snapshot.monthLabel.uppercase(),
        maxLines = 1,
        style =
          TextStyle(
            color = GrowthWidgetPalette.textMuted,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
          ),
      )
    }

    Spacer(modifier = GlanceModifier.height(14.dp))
    GrowthHeatmapGrid(cells = snapshot.cells, cellSize = 12.dp, spacing = 4.dp)
    Spacer(modifier = GlanceModifier.height(14.dp))

    Text(
      text = snapshot.footerCopy,
      maxLines = 1,
      style =
        TextStyle(
          color = GrowthWidgetPalette.textMuted,
          fontSize = 12.sp,
          fontWeight = FontWeight.Medium,
        ),
    )
  }
}

@Composable
private fun GrowthWidgetMediumContent(snapshot: GrowthWidgetSnapshot) {
  Row(
    modifier = GlanceModifier.fillMaxSize(),
    verticalAlignment = Alignment.Top,
  ) {
    Column(
      modifier = GlanceModifier.width(132.dp),
    ) {
      Row(
        modifier = GlanceModifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
      ) {
        Column(
          modifier = GlanceModifier.width(96.dp),
        ) {
          Text(
            text = snapshot.title,
            maxLines = 1,
            style =
              TextStyle(
                color = GrowthWidgetPalette.textStrong,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
              ),
          )

          Spacer(modifier = GlanceModifier.height(4.dp))

          Text(
            text = snapshot.monthLabel,
            maxLines = 1,
            style =
              TextStyle(
                color = GrowthWidgetPalette.textMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
              ),
          )
        }

        Spacer(modifier = GlanceModifier.width(8.dp))
        GrowthStatusPill(status = snapshot.status)
      }

      Spacer(modifier = GlanceModifier.height(12.dp))
      GrowthHeatmapGrid(cells = snapshot.cells, cellSize = 11.dp, spacing = 3.dp)
      Spacer(modifier = GlanceModifier.height(12.dp))

      Text(
        text = snapshot.footerCopy,
        maxLines = 1,
        style =
          TextStyle(
            color = GrowthWidgetPalette.textMuted,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
          ),
      )
    }

    Spacer(modifier = GlanceModifier.width(8.dp))

    Column(
      modifier = GlanceModifier.width(70.dp),
    ) {
      GrowthMetricBlock(label = "CURRENT", value = snapshot.currentStreak)
      Spacer(modifier = GlanceModifier.height(10.dp))
      GrowthMetricBlock(label = "LONGEST", value = snapshot.longestStreak)
    }
  }
}

@Composable
private fun GrowthHeatmapGrid(
  cells: List<GrowthWidgetCell>,
  cellSize: Dp,
  spacing: Dp,
) {
  Column {
    cells.chunked(7).forEachIndexed { rowIndex, row ->
      if (rowIndex > 0) {
        Spacer(modifier = GlanceModifier.height(spacing))
      }

      Row {
        row.forEachIndexed { columnIndex, cell ->
          if (columnIndex > 0) {
            Spacer(modifier = GlanceModifier.width(spacing))
          }

          GrowthHeatmapCell(cell = cell, cellSize = cellSize)
        }
      }
    }
  }
}

@Composable
private fun GrowthHeatmapCell(
  cell: GrowthWidgetCell,
  cellSize: Dp,
) {
  if (cell.isToday) {
    Box(
      modifier =
        GlanceModifier
          .size(cellSize)
          .background(GrowthWidgetPalette.todayOutline)
          .cornerRadius(4.dp)
          .padding(1.dp),
    ) {
      Box(
        modifier =
          GlanceModifier
            .fillMaxSize()
            .background(GrowthWidgetPalette.cellColor(cell.level))
            .cornerRadius(3.dp),
      ) {}
    }
  } else {
    Box(
      modifier =
        GlanceModifier
          .size(cellSize)
          .background(GrowthWidgetPalette.cellColor(cell.level))
          .cornerRadius(4.dp),
    ) {}
  }
}

@Composable
private fun GrowthMetricBlock(
  label: String,
  value: Int,
) {
  Column(
    modifier =
      GlanceModifier
        .fillMaxWidth()
        .background(ImageProvider(R.drawable.widget_background))
        .cornerRadius(16.dp)
        .padding(start = 12.dp, top = 10.dp, end = 12.dp, bottom = 10.dp),
  ) {
    Text(
      text = label,
      maxLines = 1,
      style =
        TextStyle(
          color = GrowthWidgetPalette.textMuted,
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
        ),
    )

    Spacer(modifier = GlanceModifier.height(6.dp))

    Text(
      text = value.coerceAtLeast(0).toString(),
      maxLines = 1,
      style =
        TextStyle(
          color = GrowthWidgetPalette.textStrong,
          fontSize = 30.sp,
          fontWeight = FontWeight.Bold,
        ),
    )
  }
}

@Composable
private fun GrowthStatusPill(status: GrowthWidgetStatus) {
  Text(
    text = statusLabel(status),
    maxLines = 1,
    style =
      TextStyle(
        color = GrowthWidgetPalette.pillText(status),
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
      ),
    modifier =
      GlanceModifier
        .background(GrowthWidgetPalette.pillFill(status))
        .cornerRadius(999.dp)
        .padding(start = 8.dp, top = 4.dp, end = 8.dp, bottom = 4.dp),
  )
}

private fun statusLabel(status: GrowthWidgetStatus) =
  when (status) {
    GrowthWidgetStatus.ACTIVE -> "Live"
    GrowthWidgetStatus.IDLE -> "Idle"
    GrowthWidgetStatus.SETUP -> "New"
  }

private fun buildGrowthWidgetIntent(
  context: Context,
  snapshot: GrowthWidgetSnapshot,
): Intent =
  Intent(Intent.ACTION_VIEW, Uri.parse(snapshot.deepLinkUrl))
    .setClass(context, MainActivity::class.java)
    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

private object GrowthWidgetPalette {
  val textStrong = androidx.glance.color.ColorProvider(day = Color(0xFF0F172A), night = Color(0xFF0F172A))
  val textMuted = androidx.glance.color.ColorProvider(day = Color(0xFF6B7280), night = Color(0xFF6B7280))
  val todayOutline = Color(0xFF166534)

  fun cellColor(level: Int) =
    when (level.coerceIn(0, 4)) {
      1 -> Color(0xFFECFDF3)
      2 -> Color(0xFFBBF7D0)
      3 -> Color(0xFF86EFAC)
      4 -> Color(0xFF22C55E)
      else -> Color(0xFFE5E7EB)
    }

  fun pillFill(status: GrowthWidgetStatus) =
    when (status) {
      GrowthWidgetStatus.ACTIVE ->
        androidx.glance.color.ColorProvider(day = Color(0xFFECFDF3), night = Color(0xFFECFDF3))
      GrowthWidgetStatus.IDLE ->
        androidx.glance.color.ColorProvider(day = Color(0xFFFEF3C7), night = Color(0xFFFEF3C7))
      GrowthWidgetStatus.SETUP ->
        androidx.glance.color.ColorProvider(day = Color(0xFFF3F4F6), night = Color(0xFFF3F4F6))
    }

  fun pillText(status: GrowthWidgetStatus) =
    when (status) {
      GrowthWidgetStatus.ACTIVE ->
        androidx.glance.color.ColorProvider(day = Color(0xFF166534), night = Color(0xFF166534))
      GrowthWidgetStatus.IDLE ->
        androidx.glance.color.ColorProvider(day = Color(0xFF92400E), night = Color(0xFF92400E))
      GrowthWidgetStatus.SETUP ->
        androidx.glance.color.ColorProvider(day = Color(0xFF4B5563), night = Color(0xFF4B5563))
    }
}
