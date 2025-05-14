/**
 * Checks if a URL is a video URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is a video URL
 */
export function isVideoUrl(url) {
  if (!url) return false;
  
  // Check for common video file extensions
  if (url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i)) {
    return true;
  }
  
  // Check for YouTube URLs
  if (isYoutubeUrl(url)) {
    return true;
  }
  
  return false;
}

/**
 * Checks if a URL is a YouTube URL
 * @param {string} url - The URL to check
 * @returns {boolean} - True if the URL is a YouTube URL
 */
export function isYoutubeUrl(url) {
  if (!url) return false;
  
  // Match various YouTube URL formats
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(\S*)?$/;
  return youtubeRegex.test(url);
}

/**
 * Converts a YouTube URL to an embed URL
 * @param {string} url - The YouTube URL
 * @returns {string} - The YouTube embed URL
 */
export function getYoutubeEmbedUrl(url) {
  if (!url) return '';
  
  // Extract video ID from URL
  const match = url.match(/^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(\S*)?$/);
  if (match && match[4]) {
    const videoId = match[4];
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&mute=1&controls=1&rel=0`;
  }
  
  return url; // Return original URL if not a valid YouTube URL
}