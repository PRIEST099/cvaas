/*
  # Add INSERT policy for user registration

  1. Security
    - Add policy to allow authenticated users to insert their own profile data
    - Ensures users can only create profiles with their own auth.uid()
    - Maintains security by preventing users from creating profiles for other users

  2. Changes
    - Add "Users can create own profile" INSERT policy on users table
    - Policy uses auth.uid() = id to ensure users can only insert their own data
*/

-- Add INSERT policy for user registration
CREATE POLICY "Users can create own profile"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);