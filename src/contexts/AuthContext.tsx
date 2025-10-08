import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  getCachedAdminProfile,
  setCachedAdminProfile,
  clearAuthCache,
  cachedFetch,
  tokenRefreshQueue
} from '@/lib/authCache';

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'super_admin';
  firstName: string;
  lastName: string;
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: AdminUser) => void;
  logout: () => void;
  updateToken: (newToken: string) => void;
  hasRole: (requiredRole: 'admin' | 'super_admin') => boolean;
  refreshAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const API_URL = import.meta.env.VITE_API_URL || '';

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('admin_token');
      const storedUser = localStorage.getItem('admin_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);

          // Validate stored token against server
          const isValid = await validateToken(storedToken);

          if (isValid) {
            setUser(parsedUser);
            setToken(storedToken);
          } else {
            // Token invalid, clean up and redirect
            clearAuthData();
          }
        } catch (error) {
          console.error('Error parsing stored auth data:', error);
          clearAuthData();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const validateToken = async (tokenToValidate: string): Promise<boolean> => {
    try {
      // Use cached API call for token validation
      const url = `${API_URL}/api/admin/profile`;
      const data = await cachedFetch(
        url,
        {
          headers: {
            'Authorization': `Bearer ${tokenToValidate}`,
          },
        },
        'admin_profile_validate',
        30 * 1000 // Cache for 30 seconds
      );

      // Update cached profile if validation succeeds
      if (data && data.admin) {
        setCachedAdminProfile(data.admin);
      }

      return !!data;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  };

  const login = (newToken: string, userData: AdminUser) => {
    localStorage.setItem('admin_token', newToken);
    localStorage.setItem('admin_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    if (token) {
      try {
        // Call logout endpoint for server-side cleanup
        await fetch(`${API_URL}/api/admin/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout API call failed:', error);
      }
    }

    clearAuthData();

    // Redirect to login if on admin page
    if (location.pathname.startsWith('/admin')) {
      navigate('/admin/login', { replace: true });
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setUser(null);
  };

  const updateToken = (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  };

  const hasRole = (requiredRole: 'admin' | 'super_admin'): boolean => {
    if (!user || !user.role) return false;

    const roleHierarchy: { [key: string]: number } = {
      'admin': 1,
      'super_admin': 2
    };

    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
  };

  const refreshAuth = async (): Promise<boolean> => {
    if (!token) return false;

    try {
      let profileData: any;

      // Check cache first for profile data
      const cachedProfile = getCachedAdminProfile();
      if (cachedProfile) {
        profileData = { admin: cachedProfile };
      } else {
        // Make fresh API call and cache it
        const response = await fetch(`${API_URL}/api/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          clearAuthData();
          return false;
        }

        profileData = await response.json();
        // Cache the profile data
        setCachedAdminProfile(profileData.admin);
      }

      setUser(profileData.admin);
      return true;
    } catch (error) {
      console.error('Auth refresh error:', error);
      clearAuthData();
      return false;
    }
  };

  const value: AuthState = {
    user,
    token,
    isAuthenticated: !!user && !!token,
    isLoading,
    login,
    logout,
    updateToken,
    hasRole,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
