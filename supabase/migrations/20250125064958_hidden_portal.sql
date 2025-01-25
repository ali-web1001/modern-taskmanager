/*
  # Create tasks table and enable RLS

  1. New Tables
    - `tasks`
      - `id` (uuid, primary key)
      - `title` (text)
      - `completed` (boolean)
      - `created_at` (timestamp with time zone)
      - `due_date` (timestamp with time zone, nullable)
      - `deleted_at` (timestamp with time zone, nullable)
      - `labels` (text array)
      - `category` (text, nullable)
      - `user_id` (uuid, foreign key to auth.users)

  2. Security
    - Enable RLS on `tasks` table
    - Add policies for CRUD operations
*/

CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  due_date timestamptz,
  deleted_at timestamptz,
  labels text[] DEFAULT '{}',
  category text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks"
  ON tasks
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);