-- Create attendance table
CREATE TABLE public.attendance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in TIME,
  check_out TIME,
  total_hours DECIMAL(4,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'half-day')),
  work_description TEXT,
  overtime DECIMAL(4,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employee_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (can be restricted later with auth)
CREATE POLICY "Allow public access to attendance"
ON public.attendance
FOR ALL
USING (true)
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_attendance_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_attendance_updated_at
  BEFORE UPDATE ON public.attendance
  FOR EACH ROW
  EXECUTE FUNCTION public.update_attendance_updated_at_column();

-- Insert sample attendance data
INSERT INTO public.attendance (employee_id, date, check_in, check_out, total_hours, status, work_description, overtime) VALUES
  ((SELECT id FROM public.employees WHERE email = 'rajesh.kumar@college.com' LIMIT 1), '2024-01-15', '09:00', '18:00', 9.0, 'present', 'Electrical maintenance in Building A', 1.0),
  ((SELECT id FROM public.employees WHERE email = 'priya.sharma@college.com' LIMIT 1), '2024-01-15', '09:15', '17:45', 8.5, 'late', 'Cleaning supervision', 0),
  ((SELECT id FROM public.employees WHERE email = 'amit.patel@college.com' LIMIT 1), '2024-01-15', '08:45', '17:00', 8.25, 'present', 'Carpentry work in dormitory', 0),
  ((SELECT id FROM public.employees WHERE email = 'sunita.devi@college.com' LIMIT 1), '2024-01-15', NULL, NULL, 0, 'absent', 'On medical leave', 0),
  ((SELECT id FROM public.employees WHERE email = 'rajesh.kumar@college.com' LIMIT 1), '2024-01-14', '09:30', '13:00', 3.5, 'half-day', 'Emergency plumbing repair', 0);