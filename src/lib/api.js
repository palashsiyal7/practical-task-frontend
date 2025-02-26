const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper function to get auth token
const getToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper to handle fetch with auth
const authFetch = async (url, options = {}) => {
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    
    // Handle non-JSON responses
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    
    const data = isJson ? await response.json() : { message: await response.text() };
    
    if (!response.ok) {
      console.error('API error:', url, data);
      throw new Error(data.message || `Error ${response.status}: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    console.error('Fetch error:', url, error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Network error. Please check your connection and try again.');
    }
    throw error;
  }
};

// Auth APIs
export const loginUser = (credentials) => {
  return authFetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify(credentials)
  });
};

export const registerUser = (userData) => {
  return authFetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const getCurrentUser = () => {
  return authFetch(`${API_URL}/api/auth/user`);
};

// Text submission APIs
export const submitText = (text) => {
  return authFetch(`${API_URL}/api/text/submit`, {
    method: 'POST',
    body: JSON.stringify({ text })
  });
};

export const getAllSubmissions = () => {
  return authFetch(`${API_URL}/api/text/submissions`);
};

// User management APIs (for admin)
export const getAllUsers = () => {
  return authFetch(`${API_URL}/api/users`);
};

export const updateUserRole = (userId, role) => {
  return authFetch(`${API_URL}/api/users/${userId}/role`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
};

export const getStatistics = () => {
  return authFetch(`${API_URL}/api/users/statistics`);
};