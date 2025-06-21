/*
  # Add missing RLS policy for user profile insertion

  1. Security Policy
    - Allow authenticated users to insert their own profile data
    - Ensures users can create their profile during registration
    - Maintains security by only allowing users to insert their own data

  2. Changes
    - Add INSERT policy for users table
    - Policy checks that the user can only insert data for their own ID
*/

-- Add INSERT policy for users table
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT 
  WITH CHECK (auth.uid() = id);