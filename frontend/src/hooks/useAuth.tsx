import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  role: string | null;
  login: (token: string, role: string, userData?: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      // Use the same keys as your API client
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const userData = localStorage.getItem('userData') || localStorage.getItem('user');
      const userRole = localStorage.getItem('userRole');
      
      console.log('Auth initialization:', { token: !!token, userData: !!userData, userRole });

      if (token) {
        setIsAuthenticated(true);
        
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            console.log('Parsed user data:', parsedUser);
            
            // Ensure role is set from user data if available
            const finalRole = parsedUser.role || userRole;
            
            setUser(parsedUser);
            setRole(finalRole);
            
            // Update localStorage to ensure consistency
            if (parsedUser.role && !userRole) {
              localStorage.setItem('userRole', parsedUser.role);
            }
          } catch (error) {
            console.error('Error parsing user data:', error);
            // Clear corrupted data
            clearAuthData();
          }
        } else if (userRole) {
          // If we have a role but no user data
          setRole(userRole);
        }
      } else {
        // No token found, ensure clean state
        clearAuthData();
      }
    } catch (error) {
      console.error('Error during auth initialization:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    setIsAuthenticated(false);
    setUser(null);
    setRole(null);
  };

  const login = (token: string, role: string, userData?: User) => {
    console.log('Login called with:', { token: !!token, role, userData });
    
    try {
      // Store in both formats for compatibility
      localStorage.setItem('accessToken', token);
      localStorage.setItem('token', token);
      localStorage.setItem('userRole', role);
      
      let finalUserData: User | null = null;
      
      if (userData) {
        // Ensure the user data has the role
        const userWithRole = { 
          ...userData, 
          role: userData.role || role 
        };
        localStorage.setItem('userData', JSON.stringify(userWithRole));
        localStorage.setItem('user', JSON.stringify(userWithRole));
        finalUserData = userWithRole;
      } else {
        // Create minimal user data from available info
        const minimalUser: User = {
          id: 'temp-id',
          username: 'user',
          email: 'user@example.com',
          firstName: 'User',
          lastName: 'Account',
          role: role
        };
        localStorage.setItem('userData', JSON.stringify(minimalUser));
        localStorage.setItem('user', JSON.stringify(minimalUser));
        finalUserData = minimalUser;
      }
      
      setUser(finalUserData);
      setRole(role);
      setIsAuthenticated(true);
      
      console.log('Login successful:', { user: finalUserData, role });
    } catch (error) {
      console.error('Error during login:', error);
      clearAuthData();
      throw error;
    }
  };

  const logout = () => {
    console.log('Logout called');
    clearAuthData();
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    role,
    login,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}