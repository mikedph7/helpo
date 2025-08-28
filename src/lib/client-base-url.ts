// Client-safe version that doesn't use next/headers
export function getClientBaseUrl() {
  // In the browser, we can use window.location
  if (typeof window !== "undefined") {
    return `${window.location.protocol}//${window.location.host}`;
  }
  
  // Fallback for SSR - use empty string for relative URLs
  return "";
}
