package com.godten.folo.widget

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
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
import androidx.glance.layout.Column
import androidx.glance.layout.Row
import androidx.glance.layout.Spacer
import androidx.glance.layout.fillMaxSize
import androidx.glance.layout.fillMaxWidth
import androidx.glance.layout.height
import androidx.glance.layout.padding
import androidx.glance.layout.width
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import com.godten.folo.MainActivity
import com.godten.folo.R

internal class NextRoutineWidget : GlanceAppWidget() {
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
    val snapshot = stateRepository.loadNextRoutineSnapshot(context)
    val openRoutineAction = actionStartActivity(buildNextRoutineWidgetIntent(context, snapshot))

    provideContent {
      NextRoutineWidgetContent(
        snapshot = snapshot,
        openRoutineAction = openRoutineAction,
      )
    }
  }
}

@Composable
private fun NextRoutineWidgetContent(
  snapshot: NextRoutineWidgetSnapshot,
  openRoutineAction: Action,
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
        .clickable(openRoutineAction)
        .padding(16.dp),
  ) {
    if (isMedium) {
      NextRoutineWidgetMediumContent(snapshot = snapshot)
    } else {
      NextRoutineWidgetSmallContent(snapshot = snapshot)
    }
  }
}

@Composable
private fun NextRoutineWidgetSmallContent(snapshot: NextRoutineWidgetSnapshot) {
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
            color = NextRoutineWidgetPalette.textStrong,
            fontSize = 15.sp,
            fontWeight = FontWeight.Bold,
          ),
      )

      Spacer(modifier = GlanceModifier.width(8.dp))
      NextRoutineStatusPill(status = snapshot.status)
    }

    Spacer(modifier = GlanceModifier.height(12.dp))

    Text(
      text = snapshot.headline,
      maxLines = 2,
      style =
        TextStyle(
          color = NextRoutineWidgetPalette.textStrong,
          fontSize = 22.sp,
          fontWeight = FontWeight.Bold,
        ),
    )

    Spacer(modifier = GlanceModifier.height(6.dp))

    Text(
      text = snapshot.subheadline,
      maxLines = 1,
      style =
        TextStyle(
          color = NextRoutineWidgetPalette.textMuted,
          fontSize = 12.sp,
          fontWeight = FontWeight.Medium,
        ),
    )

    Spacer(modifier = GlanceModifier.height(6.dp))

    Text(
      text = snapshot.amountLabel,
      maxLines = 2,
      style =
        TextStyle(
          color = NextRoutineWidgetPalette.textStrong,
          fontSize = 12.sp,
          fontWeight = FontWeight.Medium,
        ),
    )

    Spacer(modifier = GlanceModifier.height(12.dp))

    Text(
      text = snapshot.footerCopy,
      maxLines = 1,
      style =
        TextStyle(
          color = NextRoutineWidgetPalette.textMuted,
          fontSize = 12.sp,
          fontWeight = FontWeight.Medium,
        ),
    )
  }
}

@Composable
private fun NextRoutineWidgetMediumContent(snapshot: NextRoutineWidgetSnapshot) {
  Row(
    modifier = GlanceModifier.fillMaxSize(),
    verticalAlignment = Alignment.Top,
  ) {
    Column(
      modifier = GlanceModifier.width(136.dp),
    ) {
      Row(
        modifier = GlanceModifier.fillMaxWidth(),
        verticalAlignment = Alignment.Top,
      ) {
        Column(
          modifier = GlanceModifier.width(92.dp),
        ) {
          Text(
            text = snapshot.title,
            maxLines = 1,
            style =
              TextStyle(
                color = NextRoutineWidgetPalette.textStrong,
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
              ),
          )

          Spacer(modifier = GlanceModifier.height(4.dp))

          Text(
            text = snapshot.footerCopy,
            maxLines = 1,
            style =
              TextStyle(
                color = NextRoutineWidgetPalette.textMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium,
              ),
          )
        }

        Spacer(modifier = GlanceModifier.width(6.dp))
        NextRoutineStatusPill(status = snapshot.status)
      }

      Spacer(modifier = GlanceModifier.height(12.dp))

      Text(
        text = snapshot.headline,
        maxLines = 2,
        style =
          TextStyle(
            color = NextRoutineWidgetPalette.textStrong,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold,
          ),
      )

      Spacer(modifier = GlanceModifier.height(6.dp))

      Text(
        text = snapshot.subheadline,
        maxLines = 1,
        style =
          TextStyle(
            color = NextRoutineWidgetPalette.textMuted,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
          ),
      )

      Spacer(modifier = GlanceModifier.height(6.dp))

      Text(
        text = snapshot.amountLabel,
        maxLines = 2,
        style =
          TextStyle(
            color = NextRoutineWidgetPalette.textStrong,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
          ),
      )
    }

    Spacer(modifier = GlanceModifier.width(8.dp))

    Column(
      modifier = GlanceModifier.width(72.dp),
    ) {
      NextRoutineMetricBlock(label = "ACTIVE", value = snapshot.activeCount.toString())
      Spacer(modifier = GlanceModifier.height(10.dp))
      NextRoutineMetricBlock(
        label = "DAY",
        value = snapshot.dayOfMonth?.let { "${it}일" } ?: "--",
      )
    }
  }
}

@Composable
private fun NextRoutineMetricBlock(
  label: String,
  value: String,
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
          color = NextRoutineWidgetPalette.textMuted,
          fontSize = 10.sp,
          fontWeight = FontWeight.Bold,
        ),
    )

    Spacer(modifier = GlanceModifier.height(6.dp))

    Text(
      text = value,
      maxLines = 1,
      style =
        TextStyle(
          color = NextRoutineWidgetPalette.textStrong,
          fontSize = 24.sp,
          fontWeight = FontWeight.Bold,
        ),
    )
  }
}

@Composable
private fun NextRoutineStatusPill(status: NextRoutineWidgetStatus) {
  Text(
    text = nextRoutineStatusLabel(status),
    maxLines = 1,
    style =
      TextStyle(
        color = NextRoutineWidgetPalette.pillText(status),
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
      ),
    modifier =
      GlanceModifier
        .background(NextRoutineWidgetPalette.pillFill(status))
        .cornerRadius(999.dp)
        .padding(start = 8.dp, top = 4.dp, end = 8.dp, bottom = 4.dp),
  )
}

private fun nextRoutineStatusLabel(status: NextRoutineWidgetStatus) =
  when (status) {
    NextRoutineWidgetStatus.ACTIVE -> "Ready"
    NextRoutineWidgetStatus.PAUSED -> "Paused"
    NextRoutineWidgetStatus.SETUP -> "New"
  }

private fun buildNextRoutineWidgetIntent(
  context: Context,
  snapshot: NextRoutineWidgetSnapshot,
): Intent =
  Intent(Intent.ACTION_VIEW, Uri.parse(snapshot.deepLinkUrl))
    .setClass(context, MainActivity::class.java)
    .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)

private object NextRoutineWidgetPalette {
  val textStrong = androidx.glance.color.ColorProvider(day = Color(0xFF0F172A), night = Color(0xFF0F172A))
  val textMuted = androidx.glance.color.ColorProvider(day = Color(0xFF6B7280), night = Color(0xFF6B7280))

  fun pillFill(status: NextRoutineWidgetStatus) =
    when (status) {
      NextRoutineWidgetStatus.ACTIVE ->
        androidx.glance.color.ColorProvider(day = Color(0xFFE9F0FF), night = Color(0xFFE9F0FF))
      NextRoutineWidgetStatus.PAUSED ->
        androidx.glance.color.ColorProvider(day = Color(0xFFFEF3C7), night = Color(0xFFFEF3C7))
      NextRoutineWidgetStatus.SETUP ->
        androidx.glance.color.ColorProvider(day = Color(0xFFF3F4F6), night = Color(0xFFF3F4F6))
    }

  fun pillText(status: NextRoutineWidgetStatus) =
    when (status) {
      NextRoutineWidgetStatus.ACTIVE ->
        androidx.glance.color.ColorProvider(day = Color(0xFF1D4ED8), night = Color(0xFF1D4ED8))
      NextRoutineWidgetStatus.PAUSED ->
        androidx.glance.color.ColorProvider(day = Color(0xFF92400E), night = Color(0xFF92400E))
      NextRoutineWidgetStatus.SETUP ->
        androidx.glance.color.ColorProvider(day = Color(0xFF4B5563), night = Color(0xFF4B5563))
    }
}
