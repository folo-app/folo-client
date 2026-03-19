const baseUrl = process.env.EXPO_PUBLIC_FOLO_API_URL ?? 'http://localhost:8080/api';
let accessToken = process.env.EXPO_PUBLIC_FOLO_ACCESS_TOKEN ?? '';

export const foloApiConfig = {
  baseUrl,
  get accessToken() {
    return accessToken;
  },
};

export function setFoloAccessToken(token: string) {
  accessToken = token;
}
