import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo (in real app, this would come from your backend)
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@college.com',
    password: 'admin123',
    role: 'admin',
  },
  {
    id: '2', 
    name: 'Manager User',
    email: 'manager@college.com',
    password: 'manager123',
    role: 'manager',
  },
  {
    id: '3',
    name: 'Employee User', 
    email: 'employee@college.com',
    password: 'employee123',
    role: 'employee',
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Session timeout duration: 1 hour (in milliseconds)
  const SESSION_TIMEOUT = 1 * 60 * 60 * 1000; // 1 hour

  const checkSessionExpiration = (loginTime: number): boolean => {
    const now = Date.now();
    return (now - loginTime) > SESSION_TIMEOUT;
  };

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('auth_user');
    const storedLoginTime = localStorage.getItem('auth_login_time');

    if (storedUser && storedLoginTime) {
      try {
        const loginTime = parseInt(storedLoginTime, 10);

        // Check if session has expired
        if (checkSessionExpiration(loginTime)) {
          // Session expired, remove stored data
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_login_time');
          setUser(null);
        } else {
          // Session still valid
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        // Invalid data, clean up
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_login_time');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const foundUser = MOCK_USERS.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        avatar: foundUser.avatar,
      };

      const loginTime = Date.now();
      setUser(userWithoutPassword);
      localStorage.setItem('auth_user', JSON.stringify(userWithoutPassword));
      localStorage.setItem('auth_login_time', loginTime.toString());
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_login_time');
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    isAuthenticated: !!user,
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
