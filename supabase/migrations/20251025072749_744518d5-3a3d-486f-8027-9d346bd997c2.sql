-- Create scan_history table to store user's crop scan results
CREATE TABLE IF NOT EXISTS public.scan_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  disease TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('healthy', 'mild', 'severe')),
  description TEXT NOT NULL,
  cure TEXT[] DEFAULT '{}',
  image_data TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_scan_history_created_at ON public.scan_history(created_at DESC);

-- Enable RLS
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read and insert (public app, no auth required)
CREATE POLICY "Allow public read access" ON public.scan_history
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.scan_history
  FOR INSERT WITH CHECK (true);