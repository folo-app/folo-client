import { foloApiConfig } from '../api/config';

export function resolveAssetUrl(assetUrl?: string | null) {
  if (!assetUrl) {
    return null;
  }

  if (assetUrl.startsWith('http://') || assetUrl.startsWith('https://')) {
    return assetUrl;
  }

  return `${foloApiConfig.baseUrl}${assetUrl.startsWith('/') ? '' : '/'}${assetUrl}`;
}
