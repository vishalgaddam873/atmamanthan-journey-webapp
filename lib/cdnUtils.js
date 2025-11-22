/**
 * CDN URL Helper
 * Handles asset paths - database stores full CDN URLs, but this function
 * also supports relative paths for backward compatibility
 *
 * IMPORTANT: If your database already stores full URLs (CDN or backend),
 * this function will return them as-is (for CDN) or convert them (for backend).
 * It will NOT prepend anything to already-full URLs.
 */

const CDN_BASE_URL =
  process.env.NEXT_PUBLIC_CDN_URL || "https://d1igx7lccgvz7g.cloudfront.net";

/**
 * Checks if a path is already a full URL
 * @param {string} path - Path to check
 * @returns {boolean} True if path is a full URL
 */
const isFullUrl = (path) => {
  if (!path) return false;
  return path.startsWith("http://") || path.startsWith("https://");
};

/**
 * Returns a valid CDN URL for an asset path
 * @param {string} assetPath - Can be:
 *   - Full CDN URL (from database): "https://d1igx7lccgvz7g.cloudfront.net/assets/..."
 *   - Full backend URL (from database): "https://atmamanthan-journey-backend.fly.dev/assets/..."
 *   - Relative path (for backward compatibility): "/assets/Audio/Common/bg1.mp3"
 * @returns {string} Full CDN URL (returns as-is if already full URL, converts if relative)
 */
export const getCdnUrl = (assetPath) => {
  if (!assetPath) return "";

  // Clean up any malformed URLs (e.g., if backend URL was accidentally prepended to CDN URL)
  // Check for patterns like "backendURLhttps://cdn..." or "backendURLhttps//cdn..." (missing colon)
  const malformedPattern1 = /https?:\/\/[^\/]+https?:\/\/(.+)/;
  const malformedPattern2 = /https?:\/\/[^\/]+https?\/\/(.+)/; // Missing colon case (like the error shows)
  let malformedMatch =
    assetPath.match(malformedPattern1) || assetPath.match(malformedPattern2);

  if (malformedMatch) {
    console.warn("Detected malformed URL, fixing:", assetPath);
    // Extract the CDN URL part (everything after the second http)
    const cdnPart = malformedMatch[1];
    // Reconstruct proper CDN URL
    if (cdnPart.startsWith("//")) {
      assetPath = `https:${cdnPart}`;
    } else if (
      cdnPart.startsWith("http://") ||
      cdnPart.startsWith("https://")
    ) {
      assetPath = cdnPart;
    } else {
      assetPath = `https://${cdnPart}`;
    }
    console.log("Fixed URL:", assetPath);
  }

  // If already a full URL (database stores full URLs), handle appropriately
  if (isFullUrl(assetPath)) {
    try {
      const url = new URL(assetPath);

      // If it's already a CDN URL, return as-is (DO NOT MODIFY)
      if (
        url.hostname.includes("cloudfront.net") ||
        url.hostname.includes("d1igx7lccgvz7g") ||
        url.hostname.includes("s3") ||
        url.hostname.includes("amazonaws.com")
      ) {
        // Already a CDN URL - return exactly as-is
        return assetPath;
      }

      // If it's a backend URL, extract the path and convert to CDN
      if (
        url.hostname.includes("fly.dev") ||
        url.hostname.includes("localhost") ||
        url.hostname.includes("127.0.0.1")
      ) {
        console.warn("Backend URL detected, converting to CDN:", assetPath);
        const path = url.pathname;
        // Ensure path doesn't have leading slash (CDN paths should not)
        const cleanPath = path.startsWith("/") ? path.slice(1) : path;
        return `${CDN_BASE_URL}/${cleanPath}`;
      }

      // For any other full URL (external CDN, etc.), return as-is
      return assetPath;
    } catch (e) {
      console.error("Invalid URL in getCdnUrl:", assetPath, e);
      // Try to extract just the path part if it looks like a malformed URL
      const pathMatch = assetPath.match(/(\/assets\/.+)/);
      if (pathMatch) {
        return `${CDN_BASE_URL}${pathMatch[1]}`;
      }
      // Return as-is if we can't parse it (might be valid but our parser failed)
      return assetPath;
    }
  }

  // Handle relative paths (for backward compatibility or edge cases)
  // Remove leading slash if present (CDN paths should not have leading slash)
  const cleanPath = assetPath.startsWith("/") ? assetPath.slice(1) : assetPath;

  // Construct CDN URL
  return `${CDN_BASE_URL}/${cleanPath}`;
};

/**
 * Converts multiple asset paths to CDN URLs
 * @param {string[]} assetPaths - Array of asset paths
 * @returns {string[]} Array of CDN URLs
 */
export const getCdnUrls = (assetPaths) => {
  return assetPaths.map((path) => getCdnUrl(path));
};

export default getCdnUrl;
