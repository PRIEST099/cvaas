/*
  # Create CVs table and related schema

  1. New Tables
    - `cvs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to users)
      - `title` (text) - CV title
      - `is_public` (boolean) - public visibility
      - `public_url` (text, nullable) - public URL slug
      - `template_id` (text) - template identifier
      - `version` (integer) - version number
      - `parent_id` (uuid, nullable) - parent CV for versioning
      - `status` (enum) - CV status
      - `metadata` (jsonb) - additional metadata
      - `created_at` (timestamptz) - creation timestamp
      - `updated_at` (timestamptz) - last update timestamp

  2. Security
    - Enable RLS on `cvs` table
    - Add policies for CV access control
*/

-- Create enum for CV status
CREATE TYPE cv_status AS ENUM ('draft', 'published', 'archived', 'optimizing');

-- Create CVs table
CREATE TABLE IF NOT EXISTS cvs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'My CV',
  is_public boolean DEFAULT false,
  public_url text UNIQUE,
  template_id text DEFAULT 'modern',
  version integer DEFAULT 1,
  parent_id uuid REFERENCES cvs(id) ON DELETE SET NULL,
  status cv_status DEFAULT 'draft',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their own CVs"
  ON cvs
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public CVs are readable by everyone"
  ON cvs
  FOR SELECT
  TO anon, authenticated
  USING (is_public = true);

-- Create trigger for updated_at
CREATE TRIGGER update_cvs_updated_at
  BEFORE UPDATE ON cvs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_cvs_user_id ON cvs(user_id);
CREATE INDEX IF NOT EXISTS idx_cvs_public_url ON cvs(public_url);
CREATE INDEX IF NOT EXISTS idx_cvs_status ON cvs(status);
CREATE INDEX IF NOT EXISTS idx_cvs_is_public ON cvs(is_public);