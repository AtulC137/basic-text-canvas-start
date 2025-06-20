
-- Create a table to track file compressions/uploads
CREATE TABLE public.compression_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  file_id UUID,
  original_size INTEGER,
  compressed_size INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.compression_jobs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert new compression jobs for themselves
CREATE POLICY "Allow users to insert their own jobs"
  ON public.compression_jobs
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can select their own jobs
CREATE POLICY "Allow users to see their own jobs"
  ON public.compression_jobs
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can update their own jobs
CREATE POLICY "Allow users to update their own jobs"
  ON public.compression_jobs
  FOR UPDATE
  USING (user_id = auth.uid());

-- Policy: Users can delete their own jobs
CREATE POLICY "Allow users to delete their own jobs"
  ON public.compression_jobs
  FOR DELETE
  USING (user_id = auth.uid());
