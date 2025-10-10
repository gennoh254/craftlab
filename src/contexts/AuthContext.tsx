import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  name: string;
  email: string;
  userType: 'attachee' | 'intern' | 'apprentice' | 'volunteer' | 'organization';
  createdAt: string;
  profilePicture?: string;
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

// Local storage fallback for when Supabase is unavailable
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

  // Check for existing authentication on app start
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check Supabase session first
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single();

          // If profile exists, use it
          if (profile && !profileError) {
            const userData: User = {
              id: profile.id,
              name: profile.name,
              email: profile.email,
              userType: profile.user_type as User['userType'],
              createdAt: profile.created_at,
              profilePicture: profile.profile_picture
            };
            setUser(userData);
            setIsAuthenticated(true);
          } else if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create basic user data from auth
            const userData: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              userType: 'attachee',
              createdAt: session.user.created_at
            };
            setUser(userData);
            setIsAuthenticated(true);
          }
        } else {
          // Fallback to local authentication
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
        }
      } catch (error) {
        console.log('Supabase unavailable, using local authentication');
        // Fallback to local validation
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
      }
      
      setLoading(false);
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single();

        if (profile && !profileError) {
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            userType: profile.user_type as User['userType'],
            createdAt: profile.created_at,
            profilePicture: profile.profile_picture
          };
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          // Create basic user data from auth if profile doesn't exist
          const userData: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            userType: 'attachee',
            createdAt: session.user.created_at
          };
          setUser(userData);
          setIsAuthenticated(true);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (name: string, email: string, password: string, userType: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Try Supabase first
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile in database
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .insert({
            auth_user_id: authData.user.id,
            name,
            email,
            user_type: userType,
          })
          .select()
          .single();

        if (profileError) throw profileError;

        const userData: User = {
          id: profile.id,
          name: profile.name,
          email: profile.email,
          userType: profile.user_type as User['userType'],
          createdAt: profile.created_at,
          profilePicture: profile.profile_picture
        };

        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }
      
      return false;
    } catch (error) {
      console.log('Supabase unavailable, using local registration');
      
      // Fallback to local registration
      const users = getStoredUsers();
      
      // Check if email already exists
      if (users.some(u => u.email === email)) {
        return false;
      }
      
      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        userType: userType as User['userType'],
        createdAt: new Date().toISOString()
      };
      
      // Store user locally
      users.push(newUser);
      storeUsers(users);
      
      // Generate and store token
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
      // Try Supabase first
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_user_id', authData.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            userType: profile.user_type as User['userType'],
            createdAt: profile.created_at,
            profilePicture: profile.profile_picture
          };

          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }
      
      return false;
    } catch (error) {
      // Check if this is an authentication error vs connection error
      if (error && typeof error === 'object' && 'message' in error) {
        const errorMessage = (error as any).message;
        if (errorMessage.includes('Invalid login credentials')) {
          console.log('Supabase rejected credentials: Invalid login credentials');
          return false;
        }
      }
      
      console.log('Supabase unavailable, using local authentication');
      
      // Fallback to local authentication
      const users = getStoredUsers();
      const user = users.find(u => u.email === email);
      
      if (user) {
        // In a real app, you'd verify the password hash
        // For demo purposes, we'll accept any password for existing users
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

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.log('Supabase unavailable for logout');
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem(LOCAL_TOKEN_KEY);
    }
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