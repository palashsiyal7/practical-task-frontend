import { createContext, useReducer, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  // Check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        dispatch({ type: 'AUTH_ERROR' });
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/user`, {
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
          localStorage.removeItem('token');
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('token');
        dispatch({ type: 'AUTH_ERROR' });
      }
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: data
        });
        
        router.push('/dashboard');
      } else {
        dispatch({
          type: 'LOGIN_FAIL',
          payload: data.message
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      
      dispatch({
        type: 'LOGIN_FAIL',
        payload: 'Server error. Please try again.'
      });
    }
  };

  // Register
  const register = async (email, password, role = 'user') => {
    dispatch({ type: 'LOADING' });
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('token', data.token);
        
        dispatch({
          type: 'REGISTER_SUCCESS',
          payload: data
        });
        
        router.push('/dashboard');
      } else {
        dispatch({
          type: 'REGISTER_FAIL',
          payload: data.message
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      dispatch({
        type: 'REGISTER_FAIL',
        payload: 'Server error. Please try again.'
      });
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
    router.push('/auth/login');
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};