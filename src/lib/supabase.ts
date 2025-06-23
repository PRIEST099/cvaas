import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to handle Supabase errors
export function handleSupabaseError(error: any) {
  console.error('Supabase error:', error)
  
  // Handle specific error types for better user experience
  if (error.message === 'Failed to fetch') {
    // Check if environment variables are properly set
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration is missing. Please check your environment variables.')
    }
    
    // Provide more specific error message for fetch failures
    throw new Error('Unable to connect to the database. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.')
  }
  
  // Handle authentication errors
  if (error.message?.includes('JWT') || error.message?.includes('token')) {
    throw new Error('Your session has expired. Please log in again.')
  }
  
  // Handle permission errors
  if (error.message?.includes('permission') || error.message?.includes('policy')) {
    throw new Error('You do not have permission to perform this action.')
  }
  
  // Handle network timeout errors
  if (error.message?.includes('timeout') || error.message?.includes('ECONNRESET')) {
    throw new Error('Request timed out. Please check your internet connection and try again.')
  }
  
  // Default error handling
  throw new Error(error.message || 'An unexpected error occurred. Please try again.')
}

// Helper function to get current user
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Helper function to get user profile
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  } catch (error) {
    handleSupabaseError(error)
  }
}

// Helper function to check user role
export async function checkUserRole(requiredRole: 'candidate' | 'recruiter') {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const profile = await getUserProfile(user.id)
    if (profile.role !== requiredRole) {
      throw new Error(`Access denied. Required role: ${requiredRole}`)
    }
    
    return profile
  } catch (error) {
    handleSupabaseError(error)
  }
}