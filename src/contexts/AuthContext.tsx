import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  userType: 'attachee' | 'intern' | 'apprentice' | 'volunteer' | 'organization';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, userType: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('craftlab_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('craftlab_user');
      }
    }
  }, []);

  const register = async (name: string, email: string, password: string, userType: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('craftlab_registered_users') || '[]');
      const userExists = existingUsers.some((u: any) => u.email === email);
      
      if (userExists) {
        setLoading(false);
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        userType: userType as User['userType']
      };
      
      // Save to registered users list
      const updatedUsers = [...existingUsers, { ...newUser, password }];
      localStorage.setItem('craftlab_registered_users', JSON.stringify(updatedUsers));
      
      // Set as current user
      setUser(newUser);
      localStorage.setItem('craftlab_user', JSON.stringify(newUser));
      
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      setLoading(false);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check registered users
      const registeredUsers = JSON.parse(localStorage.getItem('craftlab_registered_users') || '[]');
      const foundUser = registeredUsers.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userWithoutPassword: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          userType: foundUser.userType
        };
        
        setUser(userWithoutPassword);
        localStorage.setItem('craftlab_user', JSON.stringify(userWithoutPassword));
        setLoading(false);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('craftlab_user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};