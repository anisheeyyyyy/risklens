import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, UserProfile } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  availableUsers: UserProfile[];
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  isLoginModalOpen: boolean;
  login: (payload: {
    email: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; user: UserProfile }>;
  register: (payload: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; message: string; user: UserProfile }>;
  resetPassword: (payload: {
    token: string;
    newPassword: string;
  }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; devLink?: string }>;
  logout: () => Promise<void>;
  switchUser: (user: UserProfile) => Promise<void> | void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const stored = localStorage.getItem('risklens_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('risklens_token');
  });

  const [availableUsers, setAvailableUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  const refreshUsers = async () => {
    try {
      const users = await api.auth.getUsers();
      if (users && users.length > 0) {
        setAvailableUsers(users);
      }
    } catch (e) {
      console.warn('Failed to load users list from Supabase:', e);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      const currentToken = localStorage.getItem('risklens_token');
      if (!currentToken) {
        if (isMounted) setIsInitializing(false);
        return;
      }
      try {
        const u = await api.auth.getMe();
        if (isMounted && u) {
          setUser(u);
          localStorage.setItem('risklens_user', JSON.stringify(u));
        }
      } catch (err: any) {
        console.warn('Session check warning:', err?.message || err);
        // If server explicitly returns 401 Unauthorized, clear session
        if (err?.message?.includes('401') || err?.message?.includes('Unauthorized') || err?.message?.includes('expired')) {
          if (isMounted) {
            setUser(null);
            setToken(null);
            localStorage.removeItem('risklens_token');
            localStorage.removeItem('risklens_user');
          }
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };
    
    initializeAuth();
    refreshUsers();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (payload: { email: string; password: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(payload);
      const authenticatedUser = res.user;
      const sessionToken = res.token;

      setUser(authenticatedUser);
      setToken(sessionToken);

      localStorage.setItem('risklens_user', JSON.stringify(authenticatedUser));
      localStorage.setItem('risklens_token', sessionToken);

      await refreshUsers();

      return {
        success: true,
        message: res.message || 'Authenticated successfully.',
        user: authenticatedUser,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: {
    fullName: string;
    email: string;
    password: string;
    role?: string;
    avatarUrl?: string;
  }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(payload);
      const newUser = res.user;
      const sessionToken = res.token;

      setUser(newUser);
      setToken(sessionToken);

      localStorage.setItem('risklens_user', JSON.stringify(newUser));
      localStorage.setItem('risklens_token', sessionToken);

      await refreshUsers();

      return {
        success: true,
        message: res.message || 'Account registered successfully.',
        user: newUser,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (payload: { token: string; newPassword: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.resetPassword(payload);
      return {
        success: true,
        message: res.message || 'Password reset successfully.',
      };
    } catch (err: any) {
      throw new Error(err.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.forgotPassword({ email });
      return {
        success: true,
        message: res.message || 'Password reset link sent.',
        devLink: res.devLink,
      };
    } catch (err: any) {
      throw new Error(err.message || 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (e) {
      // Ignore errors on logout
    }
    localStorage.removeItem('risklens_user');
    localStorage.removeItem('risklens_token');
    setUser(null);
    setToken(null);
  };

  const switchUser = async (targetUser: UserProfile) => {
    setIsLoading(true);
    try {
      const res = await api.auth.switchUser(targetUser.id);
      setUser(res.user);
      setToken(res.token);
      localStorage.setItem('risklens_user', JSON.stringify(res.user));
      localStorage.setItem('risklens_token', res.token);
    } catch {
      setUser(targetUser);
      localStorage.setItem('risklens_user', JSON.stringify(targetUser));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        availableUsers,
        isAuthenticated: !!user || !!token,
        isInitializing,
        isLoading,
        isLoginModalOpen,
        login,
        register,
        resetPassword,
        forgotPassword,
        logout,
        switchUser,
        openLoginModal: () => setIsLoginModalOpen(true),
        closeLoginModal: () => setIsLoginModalOpen(false),
        refreshUsers,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
