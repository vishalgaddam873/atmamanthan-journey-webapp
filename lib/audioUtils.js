/**
 * Audio Utility Functions
 * Helper functions for audio URL resolution, validation, and error handling
 */

/**
 * Resolves an audio URL to a full URL
 * @param {string} src - The audio source path (can be relative or absolute URL)
 * @returns {string} - The resolved full URL
 */
export const resolveAudioUrl = (src) => {
  if (!src) {
    console.warn('resolveAudioUrl: Empty src provided');
    return '';
  }

  // If src already starts with http:// or https://, return as-is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // Otherwise, prefix with backend URL
  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
  
  // Ensure src starts with / if it doesn't already
  const normalizedPath = src.startsWith('/') ? src : `/${src}`;
  
  // Encode the path properly for URLs (handles spaces and special characters)
  const encodedPath = encodeURI(normalizedPath);
  
  const fullUrl = `${backendUrl}${encodedPath}`;
  
  console.log(`resolveAudioUrl: Resolved "${src}" to "${fullUrl}"`);
  
  return fullUrl;
};

/**
 * Validates an audio URL format
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if URL appears valid
 */
export const validateAudioUrl = (url) => {
  if (!url) {
    console.error('validateAudioUrl: Empty URL provided');
    return false;
  }

  try {
    // Try to create a URL object to validate
    const urlObj = new URL(url);
    if (!urlObj.protocol || (!urlObj.protocol.startsWith('http'))) {
      console.error('validateAudioUrl: Invalid protocol:', urlObj.protocol);
      return false;
    }
    return true;
  } catch (error) {
    console.error('validateAudioUrl: Invalid URL format:', url, error);
    return false;
  }
};

/**
 * Validates that an MP3 file exists and is accessible via HEAD request
 * @param {string} url - The URL to validate
 * @returns {Promise<{valid: boolean, status?: number, contentType?: string, error?: string}>}
 */
export const validateMp3Url = async (url) => {
  if (!url) {
    return { valid: false, error: 'Empty URL provided' };
  }

  // First validate URL format
  if (!validateAudioUrl(url)) {
    return { valid: false, error: 'Invalid URL format' };
  }

  try {
    // Use HEAD request to check if file exists without downloading
    const response = await fetch(url, {
      method: 'HEAD',
      mode: 'cors',
      cache: 'no-cache'
    });

    const status = response.status;
    const contentType = response.headers.get('Content-Type') || '';
    const contentLength = response.headers.get('Content-Length');

    if (status === 200) {
      // Check Content-Type
      const validContentTypes = ['audio/mpeg', 'audio/mp3', 'audio/mpeg3', 'audio/x-mpeg-3'];
      const isValidContentType = validContentTypes.some(type => 
        contentType.toLowerCase().includes(type)
      );

      if (!isValidContentType && contentType) {
        console.warn(`⚠️ Unexpected Content-Type for MP3: ${contentType}`);
        // Still allow it - some servers don't set Content-Type correctly
      }

      console.log(`✅ MP3 URL validated: ${url}`);
      console.log(`   Status: ${status}, Content-Type: ${contentType}, Size: ${contentLength} bytes`);
      return { valid: true, status, contentType };
    } else if (status === 404) {
      console.error(`❌ File not found on server: ${url}`);
      console.error(`   Status: ${status} - File does not exist at this path`);
      return { valid: false, status, error: 'File not found (404)' };
    } else if (status === 403) {
      console.error(`❌ Access denied: ${url}`);
      console.error(`   Status: ${status} - Check CORS and permissions`);
      return { valid: false, status, error: 'Access denied (403)' };
    } else {
      console.error(`❌ HTTP error: ${url}`);
      console.error(`   Status: ${status}`);
      return { valid: false, status, error: `HTTP ${status}` };
    }
  } catch (error) {
    // Network error or CORS issue
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      // CORS may block HEAD requests, but audio element might still work
      // Be lenient - allow audio to try loading
      console.warn(`⚠️ HEAD request blocked by CORS: ${url}`);
      console.warn(`   This is common - audio element may still work`);
      console.warn(`   Will attempt to load audio anyway`);
      return { valid: true, corsBlocked: true, error: 'CORS blocked HEAD request (may still work)' };
    }
    
    // For other errors, be lenient too - let audio element try
    console.warn(`⚠️ Validation error for ${url}: ${error.message}`);
    console.warn(`   Will attempt to load audio anyway`);
    return { valid: true, validationError: true, error: error.message || 'Unknown error' };
  }
};

/**
 * Logs detailed audio error information
 * @param {HTMLAudioElement} audioElement - The audio element that errored
 * @param {string} context - Context where the error occurred
 */
export const logAudioError = (audioElement, context = 'Unknown') => {
  if (!audioElement) {
    console.error(`[${context}] Audio error: No audio element provided`);
    return;
  }

  // Guard against empty src errors
  if (!audioElement.src || audioElement.src === window.location.href) {
    console.warn(`[${context}] Audio error with empty/invalid src - ignoring`);
    return;
  }

  const error = audioElement.error;
  const src = audioElement.src;
  const readyState = audioElement.readyState;
  const networkState = audioElement.networkState;

  console.error(`[${context}] Audio Error Details:`, {
    src,
    readyState,
    networkState,
    errorCode: error?.code,
    errorMessage: error?.message,
    errorName: error?.name,
  });

  // Provide helpful error messages based on error code
  if (error) {
    const MediaError = window.MediaError || {
      MEDIA_ERR_ABORTED: 1,
      MEDIA_ERR_NETWORK: 2,
      MEDIA_ERR_DECODE: 3,
      MEDIA_ERR_SRC_NOT_SUPPORTED: 4
    };

    switch (error.code) {
      case MediaError.MEDIA_ERR_ABORTED:
        console.error(`[${context}] Audio playback was aborted`);
        break;
      case MediaError.MEDIA_ERR_NETWORK:
        console.error(`[${context}] Network error while loading audio`);
        console.error(`[${context}] Check your internet connection and CORS settings`);
        break;
      case MediaError.MEDIA_ERR_DECODE:
        console.error(`[${context}] Audio decoding error - file may be corrupted`);
        console.error(`[${context}] Audio URL: ${src}`);
        console.error(`[${context}] Try checking if the file exists and is a valid MP3 file`);
        break;
      case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
        console.error(`[${context}] Audio format not supported or source not found`);
        console.error(`[${context}] Audio URL: ${src}`);
        console.error(`[${context}] Check if URL is correct and CORS is properly configured`);
        console.error(`[${context}] Verify the exact filename matches what's on the server`);
        break;
      default:
        console.error(`[${context}] Unknown audio error (code: ${error.code})`);
    }
  }
};
