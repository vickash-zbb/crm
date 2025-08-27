-- Create colleges table
CREATE TABLE public.colleges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  location TEXT,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work_entries table
CREATE TABLE public.work_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  college_id UUID REFERENCES public.colleges(id) ON DELETE CASCADE NOT NULL,
  location TEXT NOT NULL,
  work_description TEXT NOT NULL,
  work_type TEXT NOT NULL,
  length DECIMAL(10,2),
  width DECIMAL(10,2),
  height DECIMAL(10,2),
  square_feet DECIMAL(10,2),
  rate_per_sqft DECIMAL(10,2),
  final_rate DECIMAL(10,2),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in-progress', 'completed')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later with auth)
CREATE POLICY "Allow public access to colleges" 
ON public.colleges 
FOR ALL 
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public access to work entries" 
ON public.work_entries 
FOR ALL 
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_colleges_updated_at
  BEFORE UPDATE ON public.colleges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_entries_updated_at
  BEFORE UPDATE ON public.work_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample colleges
INSERT INTO public.colleges (name, location, contact_person, phone, email, address) VALUES
  ('Government Engineering College', 'Mumbai', 'Dr. Rajesh Kumar', '+91-9876543210', 'principal@gec-mumbai.edu.in', '123 College Road, Mumbai, Maharashtra'),
  ('State Medical College', 'Pune', 'Dr. Priya Sharma', '+91-9876543211', 'admin@smc-pune.edu.in', '456 University Avenue, Pune, Maharashtra'),
  ('Arts & Science College', 'Nashik', 'Prof. Amit Patel', '+91-9876543212', 'info@asc-nashik.edu.in', '789 Education Street, Nashik, Maharashtra'),
  ('Commerce College', 'Nagpur', 'Dr. Sunita Singh', '+91-9876543213', 'contact@cc-nagpur.edu.in', '321 Business District, Nagpur, Maharashtra');