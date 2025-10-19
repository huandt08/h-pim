import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, LoginCredentials, RegisterData } from '../types';
import { AuthService } from '../services';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message?: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  belongsToDepartment: (departmentCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        const storedUser = AuthService.getCurrentUser();
        const token = localStorage.getItem('auth_token');

        if (storedUser && token) {
          // Verify token is still valid by fetching profile
          const response = await AuthService.getProfile();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            // Token expired or invalid
            AuthService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        AuthService.logout();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      const response = await AuthService.login(credentials);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Login failed' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true);
      const response = await AuthService.register(userData);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Registration failed' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const response = await AuthService.updateProfile(data);
      
      if (response.success && response.data) {
        setUser(response.data);
        return { success: true };
      } else {
        return { 
          success: false, 
          message: response.message || 'Profile update failed' 
        };
      }
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Profile update failed' 
      };
    }
  };

  const refreshUser = async () => {
    try {
      const response = await AuthService.getProfile();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    return user?.permissions?.includes(permission) || false;
  };

  const hasRole = (role: string): boolean => {
    return user?.roles?.includes(role) || false;
  };

  const belongsToDepartment = (departmentCode: string): boolean => {
    return user?.department_code === departmentCode;
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    hasPermission,
    hasRole,
    belongsToDepartment,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;