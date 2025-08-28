-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'supervisor', 'worker')),
  department TEXT NOT NULL,
  salary DECIMAL(10,2) NOT NULL DEFAULT 0,
  join_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on-leave')),
  address TEXT,
  skills TEXT[] DEFAULT '{}',
  college_id UUID REFERENCES public.colleges(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later with auth)
CREATE POLICY "Allow public access to employees"
ON public.employees
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_employees_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_employees_updated_at_column();

-- Insert sample employees data
INSERT INTO public.employees (name, email, phone, role, department, salary, join_date, status, address, skills, college_id) VALUES
  ('Rajesh Kumar', 'rajesh.kumar@college.com', '+91 9876543210', 'manager', 'Maintenance', 45000, '2023-01-15', 'active', 'Mumbai, Maharashtra', ARRAY['Project Management', 'Electrical', 'Team Leadership'], (SELECT id FROM public.colleges WHERE name = 'Government Engineering College' LIMIT 1)),
  ('Priya Sharma', 'priya.sharma@college.com', '+91 9876543211', 'supervisor', 'Cleaning', 28000, '2023-03-20', 'active', 'Delhi, India', ARRAY['Quality Control', 'Team Management', 'Cleaning'], (SELECT id FROM public.colleges WHERE name = 'Government Engineering College' LIMIT 1)),
  ('Amit Patel', 'amit.patel@college.com', '+91 9876543212', 'worker', 'Carpentry', 22000, '2023-06-10', 'active', 'Pune, Maharashtra', ARRAY['Carpentry', 'Furniture Making', 'Wood Work'], (SELECT id FROM public.colleges WHERE name = 'State Medical College' LIMIT 1)),
  ('Sunita Devi', 'sunita.devi@college.com', '+91 9876543213', 'worker', 'Cleaning', 18000, '2023-08-05', 'on-leave', 'Chennai, Tamil Nadu', ARRAY['Cleaning', 'Housekeeping'], (SELECT id FROM public.colleges WHERE name = 'Government Engineering College' LIMIT 1));