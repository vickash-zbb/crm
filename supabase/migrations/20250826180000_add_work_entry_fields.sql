-- Add new columns to work_entries table for detailed work entry information
ALTER TABLE public.work_entries 
ADD COLUMN IF NOT EXISTS block TEXT,
ADD COLUMN IF NOT EXISTS floor TEXT,
ADD COLUMN IF NOT EXISTS work_area_or_room TEXT,
ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;

-- Update the location column comment to reflect its new purpose
COMMENT ON COLUMN public.work_entries.location IS 'General location information (deprecated - use block, floor, work_area_or_room instead)';

-- Add comments to the new columns
COMMENT ON COLUMN public.work_entries.block IS 'Building block identifier';
COMMENT ON COLUMN public.work_entries.floor IS 'Floor number or identifier';
COMMENT ON COLUMN public.work_entries.work_area_or_room IS 'Specific room or area description';
COMMENT ON COLUMN public.work_entries.quantity IS 'Number of items or units';