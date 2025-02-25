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

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
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
  return authFetch(`${API_URL}/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify({ role })
  });
};