const GROWTH_WIDGET_ROUTE = 'widget/growth-streak';

export function getGrowthWidgetDeepLink(params?: Record<string, string>) {
  const query = new URLSearchParams(params).toString();

  return query
    ? `folo://${GROWTH_WIDGET_ROUTE}?${query}`
    : `folo://${GROWTH_WIDGET_ROUTE}`;
}
