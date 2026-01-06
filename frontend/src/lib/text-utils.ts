/**
 * Utility functions for text processing and HTML entity handling
 */

/**
 * Decode HTML entities in text
 */
export function decodeHtmlEntities(text: string): string {
  if (typeof window === 'undefined') return text;
  
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Ensure text is properly encoded for display
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Clean text for dropdown display
 */
export function cleanDropdownText(text: string): string {
  return sanitizeText(text).trim();
}