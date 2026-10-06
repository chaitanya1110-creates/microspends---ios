/**
 * API Routing Utility to solve Capacitor native mobile absolute URL requirements.
 * Prepend the Google Cloud Run server URL when running on physical devices.
 */

const SERVER_BASE_URL = 'https://ais-dev-vwafgtksneasie5t5n7unh-682027296062.asia-southeast1.run.app';

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  // Check if we are running in Capacitor Native iOS or Android environment
  if (
    typeof window !== 'undefined' &&
    (window.location.origin.includes('capacitor://') ||
     window.location.origin.includes('http://localhost') && !window.location.port)
  ) {
    return `${SERVER_BASE_URL}${cleanPath}`;
  }

  // Fallback to relative routing for standard web browser environment
  return cleanPath;
}
