export const TRADE_DETAIL_ROUTE = 'trades';
export const USER_PROFILE_ROUTE = 'users';

export type NotificationDeepLinkSource = 'notification';
export type UserProfileDeepLinkSource = 'notification' | 'profile-share';

function appendSource(path: string, source?: string) {
  if (!source) {
    return `folo://${path}`;
  }

  const queryParams = new URLSearchParams({ source });
  return `folo://${path}?${queryParams.toString()}`;
}

export function getTradeDetailDeepLink(
  tradeId: number,
  source?: NotificationDeepLinkSource,
) {
  return appendSource(`${TRADE_DETAIL_ROUTE}/${tradeId}`, source);
}

export function getUserProfileDeepLink(
  userId: number,
  source?: UserProfileDeepLinkSource,
) {
  return appendSource(`${USER_PROFILE_ROUTE}/${userId}`, source);
}

export function parseNotificationDeepLinkSource(
  value: string | null | undefined,
): NotificationDeepLinkSource | undefined {
  return value === 'notification' ? value : undefined;
}

export function parseUserProfileDeepLinkSource(
  value: string | null | undefined,
): UserProfileDeepLinkSource | undefined {
  return value === 'notification' || value === 'profile-share' ? value : undefined;
}
