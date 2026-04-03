export const GROWTH_WIDGET_ROUTE = 'widget/growth-streak';
export const NEXT_ROUTINE_WIDGET_ROUTE = 'widget/next-routine';

export type GrowthWidgetDeepLinkSource = 'widget-growth';
export type RoutineWidgetDeepLinkSource = 'widget-routine';

type GrowthWidgetDeepLinkParams = {
  source?: GrowthWidgetDeepLinkSource;
};

type RoutineWidgetDeepLinkParams = {
  source?: RoutineWidgetDeepLinkSource;
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

export function getNextRoutineWidgetDeepLink(params?: RoutineWidgetDeepLinkParams) {
  const queryParams = new URLSearchParams();

  if (params?.source) {
    queryParams.set('source', params.source);
  }

  const query = queryParams.toString();

  return query
    ? `folo://${NEXT_ROUTINE_WIDGET_ROUTE}?${query}`
    : `folo://${NEXT_ROUTINE_WIDGET_ROUTE}`;
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

export function parseNextRoutineWidgetDeepLink(
  input: string,
): RoutineWidgetDeepLinkParams | null {
  const { path, queryParams } = splitGrowthWidgetDeepLink(input);

  if (path !== NEXT_ROUTINE_WIDGET_ROUTE) {
    return null;
  }

  const source = parseRoutineWidgetDeepLinkSource(queryParams.get('source'));

  return source ? { source } : {};
}

export function parseGrowthWidgetDeepLinkSource(
  value: string | null | undefined,
): GrowthWidgetDeepLinkSource | undefined {
  return value === 'widget-growth' ? value : undefined;
}

export function parseRoutineWidgetDeepLinkSource(
  value: string | null | undefined,
): RoutineWidgetDeepLinkSource | undefined {
  return value === 'widget-routine' ? value : undefined;
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
