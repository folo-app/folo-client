export const GROWTH_WIDGET_ROUTE = 'widget/growth-streak';

export type GrowthWidgetDeepLinkSource = 'widget-growth';

type GrowthWidgetDeepLinkParams = {
  source?: GrowthWidgetDeepLinkSource;
};

export function getGrowthWidgetDeepLink(params?: GrowthWidgetDeepLinkParams) {
  const queryParams = new URLSearchParams();

  if (params?.source) {
    queryParams.set('source', params.source);
  }

  const query = queryParams.toString();

  return query
    ? `folo://${GROWTH_WIDGET_ROUTE}?${query}`
    : `folo://${GROWTH_WIDGET_ROUTE}`;
}

export function parseGrowthWidgetDeepLink(
  input: string,
): GrowthWidgetDeepLinkParams | null {
  const { path, queryParams } = splitGrowthWidgetDeepLink(input);

  if (path !== GROWTH_WIDGET_ROUTE) {
    return null;
  }

  const source = parseGrowthWidgetDeepLinkSource(queryParams.get('source'));

  return source ? { source } : {};
}

export function parseGrowthWidgetDeepLinkSource(
  value: string | null | undefined,
): GrowthWidgetDeepLinkSource | undefined {
  return value === 'widget-growth' ? value : undefined;
}

function splitGrowthWidgetDeepLink(input: string) {
  if (input.includes('://')) {
    const url = new URL(input);

    return {
      path: `${url.host}${url.pathname}`.replace(/^\/+/, '').replace(/\/+$/, ''),
      queryParams: url.searchParams,
    };
  }

  const [rawPath, rawQuery = ''] = input.split('?');

  return {
    path: rawPath.replace(/^\/+/, '').replace(/\/+$/, ''),
    queryParams: new URLSearchParams(rawQuery),
  };
}
