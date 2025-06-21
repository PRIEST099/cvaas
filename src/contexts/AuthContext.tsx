import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  user: UserProfile | null;
  supabaseUser: SupabaseUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'recruiter';
  companyName?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 AuthProvider: Initial session check', { session: session?.user?.id, error });
      
      if (error) {
        console.error('❌ AuthProvider: Error getting initial session:', error);
        setIsLoading(false);
        return;
      }
      
      if (session?.user) {
        console.log('✅ AuthProvider: Found existing session for user:', session.user.id);
        setSupabaseUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        console.log('ℹ️ AuthProvider: No existing session found');
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 AuthProvider: Auth state changed', { event, userId: session?.user?.id });
      
      if (session?.user) {
        console.log('✅ AuthProvider: User authenticated:', session.user.id);
        setSupabaseUser(session.user);
        await loadUserProfile(session.user.id);
      } else {
        console.log('🚪 AuthProvider: User logged out or session ended');
        setSupabaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      console.log('🧹 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    console.log('👤 loadUserProfile: Loading profile for user:', userId);
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('📊 loadUserProfile: Query result', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ loadUserProfile: User profile not found (new user), this is normal');
        } else {
          console.error('❌ loadUserProfile: Error loading profile:', error);
          throw error;
        }
      } else {
        console.log('✅ loadUserProfile: Profile loaded successfully:', data);
        setUser(data);
      }
    } catch (error) {
      console.error('💥 loadUserProfile: Exception occurred:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 login: Starting login process for email:', email);
    
    try {
      setIsLoading(true);
      
      console.log('📡 login: Calling supabase.auth.signInWithPassword...');
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 login: SignIn response', { 
        user: data.user?.id, 
        session: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ login: Authentication failed:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ login: User authenticated successfully:', data.user.id);
        setSupabaseUser(data.user);
        await loadUserProfile(data.user.id);
      } else {
        console.warn('⚠️ login: No user returned despite no error');
      }
    } catch (error) {
      console.error('💥 login: Exception during login:', error);
      handleSupabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    console.log('📝 register: Starting registration process for email:', userData.email);
    console.log('📋 register: User data:', { 
      email: userData.email, 
      role: userData.role, 
      firstName: userData.firstName,
      lastName: userData.lastName,
      companyName: userData.companyName 
    });
    
    try {
      setIsLoading(true);
      
      // Sign up the user
      console.log('📡 register: Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      console.log('📊 register: SignUp response', { 
        user: data.user?.id, 
        session: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ register: User signup failed:', error);
        throw error;
      }

      if (data.user) {
        console.log('✅ register: User created successfully:', data.user.id);
        
        // Create user profile
        console.log('📡 register: Creating user profile in database...');
        const profileData = {
          id: data.user.id,
          email: userData.email,
          role: userData.role,
          first_name: userData.firstName,
          last_name: userData.lastName,
          company_name: userData.companyName,
        };
        
        console.log('📋 register: Profile data to insert:', profileData);
        
        const { data: profileResult, error: profileError } = await supabase
          .from('users')
          .insert(profileData)
          .select()
          .single();

        console.log('📊 register: Profile creation result', { 
          profileResult, 
          profileError: profileError?.message 
        });

        if (profileError) {
          console.error('❌ register: Profile creation failed:', profileError);
          throw profileError;
        }

        console.log('✅ register: Profile created successfully');
        setSupabaseUser(data.user);
        await loadUserProfile(data.user.id);
      } else {
        console.warn('⚠️ register: No user returned despite no error');
      }
    } catch (error) {
      console.error('💥 register: Exception during registration:', error);
      handleSupabaseError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 logout: Starting logout process...');
    
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ logout: Error during logout:', error);
        throw error;
      }
      
      console.log('✅ logout: Logout successful');
      setUser(null);
      setSupabaseUser(null);
    } catch (error) {
      console.error('💥 logout: Exception during logout:', error);
      handleSupabaseError(error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabaseUser) {
      console.error('❌ updateProfile: No authenticated user');
      throw new Error('No authenticated user');
    }

    console.log('📝 updateProfile: Updating profile for user:', supabaseUser.id);
    console.log('📋 updateProfile: Updates:', updates);

    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', supabaseUser.id)
        .select()
        .single();

      console.log('📊 updateProfile: Update result', { data, error: error?.message });

      if (error) {
        console.error('❌ updateProfile: Update failed:', error);
        throw error;
      }
      
      console.log('✅ updateProfile: Profile updated successfully');
      setUser(data);
    } catch (error) {
      console.error('💥 updateProfile: Exception during update:', error);
      handleSupabaseError(error);
    }
  };

  const value = {
    user,
    supabaseUser,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  console.log('🔄 AuthProvider: Current state', { 
    hasUser: !!user, 
    hasSupabaseUser: !!supabaseUser, 
    isLoading,
    userId: user?.id 
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}