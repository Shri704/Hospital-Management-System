import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser?.role) {
        setUser(currentUser);
        setLoading(false);
        return;
      }

      const hasToken = authService.isAuthenticated();
      if (!hasToken) {
        setLoading(false);
        return;
      }

      try {
        const profile = await authService.fetchProfile();
        if (profile?.role) {
          authService.setCurrentUser(profile);
          setUser(profile);
        } else {
          authService.logout();
        }
      } catch (error) {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };

    hydrate();
  }, []);

  const login = async (email, password) => {
    const { user: userData } = await authService.login(email, password);
    if (!userData?.role) {
      const profile = await authService.fetchProfile();
      authService.setCurrentUser(profile);
      setUser(profile);
      return profile;
    }
    setUser(userData);
    return userData;
  };

  const register = async (userInfo) => {
    const { user: userData } = await authService.register(userInfo);
    if (!userData?.role) {
      const profile = await authService.fetchProfile();
      authService.setCurrentUser(profile);
      setUser(profile);
      return profile;
    }
    setUser(userData);
    return userData;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

