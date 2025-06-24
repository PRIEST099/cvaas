import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types/database';

type UserProfile = Database['public']['Tables']['users']['Row'];

interface AuthContextType {
  supabaseUser: SupabaseUser | null;
  user: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1) Subscribe & initial session
  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data }) => setSupabaseUser(data.session?.user || null))
      .finally(() => setIsLoading(false));

    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      setSupabaseUser(session?.user || null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // 2) Load user profile when supabaseUser changes
  useEffect(() => {
    if (!supabaseUser) {
      setUser(null);
      return;
    }
    setIsLoading(true);
    supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single()
      .then(({ data, error }) => {
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          setUser(null);
        } else {
          setUser(data || null);
        }
      })
      .finally(() => setIsLoading(false));
  }, [supabaseUser]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      handleSupabaseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });
      if (authError) throw authError;
      if (!authData.user) throw new Error('No user returned');

      await supabase.from('users').upsert({
        id: authData.user.id,
        email: data.email,
        role: data.role,
        first_name: data.firstName,
        last_name: data.lastName,
        company_name: data.companyName || null,
      });
    } catch (err) {
      handleSupabaseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (err) {
      handleSupabaseError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!supabaseUser) throw new Error('Not authenticated');
    setIsLoading(true);
    try {
      const { data: updated, error } = await supabase
        .from('users')
        .upsert({ id: supabaseUser.id, ...updates })
        .single();
      if (error) throw error;
      setUser(updated);
    } catch (err) {
      handleSupabaseError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ supabaseUser, user, isLoading, login, register, logout, updateProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}
