# UI Layout Checklist

## Goal

- Prevent clipped text, overlapping buttons, and hidden bottom actions on both iOS and Android.
- Default to safe area aware layouts and compact-screen-first sizing.

## Shared Rules

- Every full-screen view should either use `Page` or an explicit `SafeAreaView`.
- Bottom CTA areas should use `BottomActionBar` so home indicator and Android gesture areas are respected.
- Label/value rows should use `DetailRow` so long text can wrap instead of clipping.
- Horizontal metric groups should use `MetricGrid`; compact screens stack instead of forcing 3 columns.
- Text next to avatars or chips should set `flex: 1` or `flexShrink: 1`.
- Rows with summary text should allow wrapping before relying on `space-between`.
- Dual input rows should collapse to a column on compact screens.
- Stock selection tiles should calculate width from screen columns instead of hard-coded percentages.

## Screens Audited

- `HomeScreen`
- `FeedScreen`
- `UserFeedScreen`
- `PortfolioScreen`
- `PublicPortfolioScreen`
- `HoldingDetailScreen`
- `TradeDetailScreen`
- `AddTradeScreen`
- `ProfileScreen`
- `UserProfileScreen`
- `PeopleScreen`
- `NotificationsScreen`
- `ProfileEditScreen`
- `ProfileImageField`
- `PortfolioSetupScreen`
- `PortfolioSetupReviewScreen`

## High-Risk Cases To Recheck

- iPhone SE / compact Android widths
- Long Korean company names
- Large currency strings and long timestamps
- Multiple chips in one row
- Keyboard open on forms with bottom CTA
- Empty, loading, and error states
- Deep-link entry into detail screens

## Manual QA Matrix

- iOS small screen: iPhone SE class width
- iOS standard screen: iPhone 16 Pro class width
- Android compact screen: around 360dp width
- Android standard screen: around 412dp width
- Web narrow viewport: around 375px width

## Screen Checks

- Auth: no clipped helper text, footer links wrap cleanly, keyboard does not hide CTA.
- Portfolio setup: tiles remain readable, footer CTA stays above inset, selected chips wrap.
- Feed/detail: reaction chips wrap, trade summaries stack on compact widths, author rows do not collide.
- Portfolio/profile: label/value rows wrap without truncating key values.
- Import/edit forms: two-column inputs collapse vertically on compact widths.

## Validation Commands

- `npm run typecheck`
- `npx expo export --platform web`
