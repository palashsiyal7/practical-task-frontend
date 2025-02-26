/**
 * Session Manager utility
 * Handles creation and management of sessions across browser windows
 */

// Generate a unique session ID
const generateSessionId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// SessionStorage key for window ID
const WINDOW_SESSION_KEY = 'app_window_session_id';

/**
 * Gets or creates a unique session ID for the current window
 * Each browser window will have its own unique ID
 */
export const getWindowSessionId = () => {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return null;
    }
    
    // Try to get existing session ID from this window's sessionStorage
    let sessionId = sessionStorage.getItem(WINDOW_SESSION_KEY);
    
    // If no session ID exists for this window, create one
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem(WINDOW_SESSION_KEY, sessionId);
    }
    
    return sessionId;
  } catch (error) {
    console.error('Error accessing sessionStorage:', error);
    return null;
  }
};

/**
 * Get session-specific storage key
 * This ensures each window's session uses unique localStorage keys
 */
export const getSessionStorageKey = (baseKey) => {
  const sessionId = getWindowSessionId();
  return sessionId ? `${baseKey}_${sessionId}` : baseKey;
};

/**
 * Store a value in localStorage with session-specific key
 */
export const setSessionItem = (key, value) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    const sessionKey = getSessionStorageKey(key);
    localStorage.setItem(sessionKey, value);
    return true;
  } catch (error) {
    console.error('Error storing session item:', error);
    return false;
  }
};

/**
 * Retrieve a value from localStorage with session-specific key
 */
export const getSessionItem = (key) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return null;
    }
    
    const sessionKey = getSessionStorageKey(key);
    return localStorage.getItem(sessionKey);
  } catch (error) {
    console.error('Error retrieving session item:', error);
    return null;
  }
};

/**
 * Remove a value from localStorage with session-specific key
 */
export const removeSessionItem = (key) => {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }
    
    const sessionKey = getSessionStorageKey(key);
    localStorage.removeItem(sessionKey);
    return true;
  } catch (error) {
    console.error('Error removing session item:', error);
    return false;
  }
}; 