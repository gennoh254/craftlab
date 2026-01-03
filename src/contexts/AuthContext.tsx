import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'attachee' | 'intern' | 'organization';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, userType: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const LOCAL_USERS_KEY = 'craftlab_users';
const LOCAL_TOKEN_KEY = 'craftlab_token';

const getStoredUsers = (): User[] => {
  try {
    const users = localStorage.getItem(LOCAL_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch {
    return [];
  }
};

const storeUsers = (users: User[]) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const generateToken = (user: User): string => {
  return btoa(JSON.stringify({ id: user.id, email: user.email, timestamp: Date.now() }));
};

const validateToken = (token: string): User | null => {
  try {
    const decoded = JSON.parse(atob(token));
    const users = getStoredUsers();
    return users.find(u => u.id === decoded.id && u.email === decoded.email) || null;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem(LOCAL_TOKEN_KEY);
    if (token) {
      const localUser = validateToken(token);
      if (localUser) {
        setUser(localUser);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem(LOCAL_TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const register = async (name: string, email: string, password: string, userType: string): Promise<boolean> => {
    setLoading(true);

    try {
      const users = getStoredUsers();

      if (users.some(u => u.email === email)) {
        return false;
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        userType: userType as User['userType'],
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      storeUsers(users);

      const token = generateToken(newUser);
      localStorage.setItem(LOCAL_TOKEN_KEY, token);

      setUser(newUser);
      setIsAuthenticated(true);

      return true;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);

    try {
      const users = getStoredUsers();
      const user = users.find(u => u.email === email);

      if (user) {
        const token = generateToken(user);
        localStorage.setItem(LOCAL_TOKEN_KEY, token);

        setUser(user);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem(LOCAL_TOKEN_KEY);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};