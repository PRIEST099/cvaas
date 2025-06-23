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

// Helper function to create a timeout promise
function createTimeoutPromise(ms: number, errorMessage: string) {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), ms);
  });
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider: Initializing auth state...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('🔍 AuthProvider: Initial session check', { 
        sessionExists: !!session, 
        userId: session?.user?.id, 
        error: error?.message 
      });
      
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
      console.log('🔔 AuthProvider: Auth state changed', { 
        event, 
        userId: session?.user?.id,
        sessionExists: !!session 
      });
      
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
      // Create a timeout promise that rejects after 8 seconds
      const timeoutPromise = createTimeoutPromise(8000, 'Profile loading timeout');
      
      // Race the database query against the timeout
      const queryPromise = supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

      console.log('📊 loadUserProfile: Query result', { 
        profileFound: !!data, 
        error: error?.message,
        errorCode: error?.code 
      });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('ℹ️ loadUserProfile: User profile not found (new user), this is normal for fresh registrations');
          // Explicitly set user to null when profile is not found
          setUser(null);
        } else {
          console.error('❌ loadUserProfile: Error loading profile:', error);
          // Set user to null for any other error as well
          setUser(null);
          throw error;
        }
      } else if (data) {
        console.log('✅ loadUserProfile: Profile loaded successfully:', {
          id: data.id,
          email: data.email,
          role: data.role,
          firstName: data.first_name,
          hasFirstName: !!data.first_name,
          hasLastName: !!data.last_name
        });
        
        // Check if profile is actually complete
        const isProfileComplete = !!(data.first_name && data.last_name && data.role);
        
        if (isProfileComplete) {
          console.log('✅ loadUserProfile: Profile is complete, setting user');
          setUser(data);
        } else {
          console.log('⚠️ loadUserProfile: Profile exists but is incomplete, keeping user null');
          setUser(null);
        }
      } else {
        // Handle case where no error but also no data
        console.log('ℹ️ loadUserProfile: No profile data returned');
        setUser(null);
      }
    } catch (error) {
      console.error('💥 loadUserProfile: Exception occurred:', error);
      // Explicitly set user to null on any exception
      setUser(null);
      // Don't throw here to prevent auth flow interruption
    } finally {
      // CRITICAL: Always set loading to false
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    console.log('🔐 login: Starting login process for email:', email);
    
    try {
      setIsLoading(true);
      
      console.log('📡 login: Calling supabase.auth.signInWithPassword...');
      
      // Create a timeout promise for the login request
      const timeoutPromise = createTimeoutPromise(10000, 'Login request timeout');
      
      const loginPromise = supabase.auth.signInWithPassword({
        email,
        password,
      });

      const { data, error } = await Promise.race([loginPromise, timeoutPromise]);

      console.log('📊 login: SignIn response', { 
        userExists: !!data.user, 
        sessionExists: !!data.session,
        error: error?.message 
      });

      if (error) {
        console.error('❌ login: Authentication failed:', error);
        throw error;
      }

      if (!data.user) {
        console.warn('⚠️ login: No user returned despite no error');
        throw new Error('Login failed: No user data received');
      }

      console.log('✅ login: User authenticated successfully:', data.user.id);
      // Note: User profile will be loaded automatically via onAuthStateChange
      
    } catch (error) {
      console.error('💥 login: Exception during login:', error);
      handleSupabaseError(error);
      throw error; // Re-throw to allow UI to handle the error
    } finally {
      // CRITICAL FIX: Always set loading to false regardless of success or failure
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
      
      // Step 1: Sign up the user with Supabase Auth
      console.log('📡 register: Calling supabase.auth.signUp...');
      
      // Create a timeout promise for the signup request
      const timeoutPromise = createTimeoutPromise(10000, 'Registration request timeout');
      
      const signupPromise = supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      const { data: authData, error: authError } = await Promise.race([signupPromise, timeoutPromise]);

      console.log('📊 register: SignUp response', { 
        userExists: !!authData.user, 
        sessionExists: !!authData.session,
        error: authError?.message,
        errorCode: authError?.code
      });

      if (authError) {
        console.error('❌ register: User signup failed:', authError);
        
        // Handle specific error cases with more helpful messages
        if (authError.code === 'user_already_exists') {
          throw new Error('This email is already registered. Please log in or use a different email address.');
        }
        
        throw authError;
      }

      if (!authData.user) {
        console.warn('⚠️ register: No user returned despite no error');
        throw new Error('Registration failed: No user data received');
      }

      console.log('✅ register: User created successfully:', authData.user.id);
      
      // Step 2: Immediately set the Supabase user in state
      setSupabaseUser(authData.user);
      
      // Step 3: Create user profile in our database using upsert
      console.log('📡 register: Creating user profile in database...');
      const profileData = {
        id: authData.user.id,
        email: userData.email,
        role: userData.role,
        first_name: userData.firstName,
        last_name: userData.lastName,
        company_name: userData.companyName || null,
      };
      
      console.log('📋 register: Profile data to upsert:', profileData);
      
      // Create a timeout promise for the profile creation
      const profileTimeoutPromise = createTimeoutPromise(10000, 'Profile creation timeout');
      
      const profilePromise = supabase
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      const { data: profileResult, error: profileError } = await Promise.race([profilePromise, profileTimeoutPromise]);

      console.log('📊 register: Profile creation result', { 
        profileCreated: !!profileResult, 
        error: profileError?.message 
      });

      if (profileError) {
        console.error('❌ register: Profile creation failed:', profileError);
        // If profile creation fails, we should sign out the user to maintain consistency
        await supabase.auth.signOut();
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      if (!profileResult) {
        console.error('❌ register: No profile data returned');
        await supabase.auth.signOut();
        throw new Error('Registration failed: Profile creation returned no data');
      }

      console.log('✅ register: Profile created successfully:', {
        id: profileResult.id,
        email: profileResult.email,
        role: profileResult.role
      });
      
      // Step 4: Immediately set the user profile in state for auto-login
      setUser(profileResult);
      
      console.log('🎉 register: Registration completed successfully - user is now logged in');
      
    } catch (error) {
      console.error('💥 register: Exception during registration:', error);
      throw error; // Re-throw the error so the UI can handle it properly
    } finally {
      // CRITICAL FIX: Always set loading to false regardless of success or failure
      setIsLoading(false);
    }
  };

  const logout = async () => {
    console.log('🚪 logout: Starting logout process...');
    
    try {
      setIsLoading(true);
      
      // Create a timeout promise for the logout request
      const timeoutPromise = createTimeoutPromise(5000, 'Logout request timeout');
      
      const logoutPromise = supabase.auth.signOut();

      const { error } = await Promise.race([logoutPromise, timeoutPromise]);
      
      if (error) {
        console.error('❌ logout: Error during logout:', error);
        throw error;
      }
      
      console.log('✅ logout: Logout successful');
      
      // Clear state immediately
      setUser(null);
      setSupabaseUser(null);
      
    } catch (error) {
      console.error('💥 logout: Exception during logout:', error);
      handleSupabaseError(error);
    } finally {
      setIsLoading(false);
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
      setIsLoading(true);
      
      // Use upsert to handle both creation and updates robustly
      console.log('📡 updateProfile: Upserting profile...');
      const profileData = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        ...updates
      };
      
      // Create a timeout promise for the profile update
      const timeoutPromise = createTimeoutPromise(10000, 'Profile update timeout');
      
      const updatePromise = supabase
        .from('users')
        .upsert(profileData, { onConflict: 'id' })
        .select()
        .single();

      const { data, error } = await Promise.race([updatePromise, timeoutPromise]);

      if (error) {
        console.error('❌ updateProfile: Upsert failed:', error);
        throw error;
      }
      
      if (!data) {
        throw new Error('Profile upsert returned no data');
      }
      
      console.log('✅ updateProfile: Profile upserted successfully');
      setUser(data);
      
    } catch (error) {
      console.error('💥 updateProfile: Exception during update:', error);
      handleSupabaseError(error);
      throw error;
    } finally {
      setIsLoading(false);
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
    userId: user?.id,
    userRole: user?.role,
    userFirstName: user?.first_name,
    userLastName: user?.last_name
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}