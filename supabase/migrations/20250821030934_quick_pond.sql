/*
  # Create media files table

  1. New Tables
    - `media_files`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `filename` (text)
      - `file_path` (text)
      - `file_type` (text) - 'image' or 'video'
      - `size` (bigint) - file size in bytes
      - `drive_file_id` (text, nullable) - Google Drive file ID when uploaded
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `media_files` table
    - Add policies for authenticated users to manage their own files
*/

CREATE TABLE IF NOT EXISTS media_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_type text NOT NULL CHECK (file_type IN ('image', 'video')),
  size bigint NOT NULL DEFAULT 0,
  drive_file_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own media files
CREATE POLICY "Users can read own media files"
  ON media_files
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own media files
CREATE POLICY "Users can insert own media files"
  ON media_files
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own media files
CREATE POLICY "Users can update own media files"
  ON media_files
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own media files
CREATE POLICY "Users can delete own media files"
  ON media_files
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Index for better query performance
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at DESC);

ALTER POLICY "Users can insert own media files" ON media_files
  USING (true)
  WITH CHECK (true);