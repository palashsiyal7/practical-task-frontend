import { createContext, useReducer, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionItem, setSessionItem, removeSessionItem, getWindowSessionId } from '@/utils/sessionManager';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_ERROR':
    case 'LOGIN_FAIL':
    case 'REGISTER_FAIL':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'LOADING':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [userChecked, setUserChecked] = useState(false);
  const [windowSessionId, setWindowSessionId] = useState(null);

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize window session ID for this browser window
  useEffect(() => {
    if (isClient) {
      const sessionId = getWindowSessionId();
      setWindowSessionId(sessionId);
      
      // Log to confirm we're getting a unique session per window
      console.log('Window Session ID:', sessionId);
    }
  }, [isClient]);

  // Memoize clearError to prevent it from changing on every render
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Check if user is logged in - only run once
  useEffect(() => {
    // Only run on client and if we haven't checked the user yet
    if (!isClient || userChecked || !windowSessionId) return;

    const loadUser = async () => {
      // Use try/catch for localStorage to handle SSR
      try {
        const token = getSessionItem('token');
        
        if (!token) {
          dispatch({ type: 'AUTH_ERROR' });
          setUserChecked(true);
          return;
        }

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/user`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const data = await res.json();
          
          if (res.ok) {
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: data
            });
          } else {
            removeSessionItem('token');
            dispatch({ type: 'AUTH_ERROR' });
          }
        } catch (error) {
          console.error('Error loading user:', error);
          removeSessionItem('token');
          dispatch({ type: 'AUTH_ERROR' });
        }
        
        setUserChecked(true);
      } catch (e) {
        console.error('localStorage is not available:', e);
        dispatch({ type: 'AUTH_ERROR' });
        setUserChecked(true);
      }
    };

    loadUser();
  }, [isClient, userChecked, windowSessionId]);

  // Login
  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        try {
          setSessionItem('token', data.token);
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: data
          });
          
          // Navigate after state has settled
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          
          return true;
        } catch (e) {
          console.error('localStorage is not available:', e);
          dispatch({
            type: 'LOGIN_FAIL',
            payload: 'Local storage unavailable. Please check your browser settings.'
          });
          return false;
        }
      } else {
        dispatch({
          type: 'LOGIN_FAIL',
          payload: data.message || 'Login failed. Please check your credentials.'
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      
      dispatch({
        type: 'LOGIN_FAIL',
        payload: 'Server error. Please try again.'
      });
      return false;
    }
  };

  // Register
  const register = async (email, password, role = 'user') => {
    dispatch({ type: 'LOADING' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        try {
          setSessionItem('token', data.token);
          
          dispatch({
            type: 'REGISTER_SUCCESS',
            payload: data
          });
          
          // Navigate after state has settled
          setTimeout(() => {
            router.push('/dashboard');
          }, 100);
          
          return true;
        } catch (e) {
          console.error('localStorage is not available:', e);
          dispatch({
            type: 'REGISTER_FAIL',
            payload: 'Local storage unavailable. Please check your browser settings.'
          });
          return false;
        }
      } else {
        dispatch({
          type: 'REGISTER_FAIL',
          payload: data.message || 'Registration failed. Please try again.'
        });
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: 'Server error. Please try again.'
      });
      return false;
    }
  };

  // Logout
  const logout = useCallback(() => {
    try {
      removeSessionItem('token');
      dispatch({ type: 'LOGOUT' });
      
      // Navigate after state has settled
      setTimeout(() => {
        router.push('/auth/login');
      }, 100);
    } catch (e) {
      console.error('localStorage is not available:', e);
      dispatch({ type: 'LOGOUT' });
    }
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        error: state.error,
        login,
        register,
        logout,
        clearError,
        windowSessionId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};