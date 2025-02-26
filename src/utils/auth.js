import { getSessionItem } from './sessionManager';

export const isLoggedIn = () => {
  // Check if the user is logged in using session-specific token
  return !!getSessionItem('token');
};

export const getToken = () => {
  return getSessionItem('token');
};
