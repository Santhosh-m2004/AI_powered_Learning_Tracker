import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios.js';
import { toast } from 'react-hot-toast';

const AuthContext = createContext({});
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await API.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await API.post('/auth/login', { email, password });

      const token = response.data?.token;
      if (!token) throw new Error('Invalid login response');

      localStorage.setItem('token', token);

      const profile = await API.get('/auth/profile');
      setUser(profile.data);

      toast.success('Login successful');
      navigate('/');

      return profile.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Login failed';
      toast.error(msg);
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', { name, email, password });

      const token = response.data?.token;
      if (!token) throw new Error('Invalid registration response');

      localStorage.setItem('token', token);

      const profile = await API.get('/auth/profile');
      setUser(profile.data);

      toast.success('Registration successful');
      navigate('/');

      return profile.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Registration failed';
      toast.error(msg);
      throw error;
    }
  };

  const googleLogin = async (googleData) => {
    try {
      const response = await API.post('/auth/google', googleData);

      const token = response.data?.token;
      if (!token) throw new Error('Invalid Google login response');

      localStorage.setItem('token', token);

      const profile = await API.get('/auth/profile');
      setUser(profile.data);

      toast.success('Google login successful');
      navigate('/');

      return profile.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Google login failed';
      toast.error(msg);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await API.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API error:', error);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      toast.success('Logged out');
      navigate('/login', { replace: true });
    }
  };

  const updateProfile = async (data) => {
    try {
      const response = await API.put('/auth/profile', data);
      setUser(response.data);
      toast.success('Profile updated');
      return response.data;
    } catch (error) {
      const msg = error?.response?.data?.message || 'Update failed';
      toast.error(msg);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    googleLogin,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};