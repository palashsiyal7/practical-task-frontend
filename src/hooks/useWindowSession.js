import { useEffect, useState, useContext } from 'react';
import { getWindowSessionId } from '@/utils/sessionManager';
import { AuthContext } from '@/context/AuthContext';

/**
 * Custom hook for window session management
 * Provides utilities for working with per-window sessions
 */
export const useWindowSession = () => {
  const [sessionId, setSessionId] = useState(null);
  const { windowSessionId } = useContext(AuthContext);

  useEffect(() => {
    // Use the session ID from context if available (preferred)
    // or get it directly if needed
    if (windowSessionId) {
      setSessionId(windowSessionId);
    } else {
      // Only run on client-side
      if (typeof window !== 'undefined') {
        const id = getWindowSessionId();
        setSessionId(id);
      }
    }
  }, [windowSessionId]);

  /**
   * Check if this is a new window session
   * This can be used to determine if specific actions should be taken for new windows
   */
  const isNewWindowSession = () => {
    // This will be true only the first time a window is opened
    // as sessionStorage persists only for the current window
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') {
      return false;
    }
    
    const isNewSession = sessionStorage.getItem('__window_session_initialized') !== 'true';
    
    if (isNewSession) {
      // Mark this window as initialized
      sessionStorage.setItem('__window_session_initialized', 'true');
    }
    
    return isNewSession;
  };

  return {
    sessionId,
    isNewWindowSession,
    isNewWindow: isNewWindowSession() // Convenience property
  };
};

export default useWindowSession; 