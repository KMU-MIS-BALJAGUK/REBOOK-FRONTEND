const fallbackBaseUrl = 'https://rebook-app.cloud';
const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();

// Priority: EXPO_PUBLIC_API_BASE_URL > fallback
export const API_BASE_URL = (envBaseUrl && envBaseUrl.length > 0 ? envBaseUrl : fallbackBaseUrl).replace(/\/+$/, '');
export const DEFAULT_HEADERS: Record<string, string> = {
  'Content-Type': 'application/json',
};
