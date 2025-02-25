export const isLoggedIn = () => {
  // Check if the user is logged in (e.g., check for a token in local storage)
  return !!localStorage.getItem('token');
};

export const getToken = () => {
  return localStorage.getItem('token');
};
