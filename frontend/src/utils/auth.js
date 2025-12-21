export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const getUserRole = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const parsedUser = JSON.parse(user);
      return parsedUser.role || 'user';
    } catch {
      return 'user';
    }
  }
  return 'user';
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    Authorization: `Bearer ${token}`
  };
};