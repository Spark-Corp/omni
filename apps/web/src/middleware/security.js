/**
 * Security headers middleware
 * Adds common HTTP security headers to protect against common web vulnerabilities
 */

const SECURITY_HEADERS = {
  // Prevent clickjacking attacks - deny framing by any site
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing - ensures browser respects Content-Type header
  'X-Content-Type-Options': 'nosniff',
  
  // Enable XSS filter in browser (legacy but still adds defense)
  'X-XSS-Protection': '1; mode=block',
  
  // Control how much referrer info is sent with requests
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Basic Content Security Policy - restrict resource loading
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https: wss:",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
  
  // Control embedding in iframes (additional layer to X-Frame-Options)
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
};

/**
 * Apply security headers to a Response object
 * @param {Response} response - The original response
 * @returns {Response} - New response with security headers
 */
export function securityHeaders(response) {
  // Clone the response to avoid modifying the original
  const newResponse = new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: new Headers(response.headers),
  });
  
  // Add each security header
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    newResponse.headers.set(key, value);
  }
  
  return newResponse;
}

/**
 * Create a response with security headers
 * @param {string|object|null} data - Response body
 * @param {object} options - Response options (status, headers, etc.)
 * @returns {Response} - Response with security headers
 */
export function jsonResponse(data, options = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  const response = new Response(body, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  return securityHeaders(response);
}

/**
 * Create a text response with security headers
 * @param {string} text - Response body
 * @param {object} options - Response options (status, headers, etc.)
 * @returns {Response} - Response with security headers
 */
export function textResponse(text, options = {}) {
  const response = new Response(text, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'text/plain',
      ...options.headers,
    },
  });
  
  return securityHeaders(response);
}

/**
 * Create an HTML response with security headers
 * @param {string} html - HTML content
 * @param {object} options - Response options (status, headers, etc.)
 * @returns {Response} - Response with security headers
 */
export function htmlResponse(html, options = {}) {
  const response = new Response(html, {
    status: options.status || 200,
    headers: {
      'Content-Type': 'text/html',
      ...options.headers,
    },
  });
  
  return securityHeaders(response);
}

export default {
  securityHeaders,
  jsonResponse,
  textResponse,
  htmlResponse,
  SECURITY_HEADERS,
};
