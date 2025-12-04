-- Add settings column to clinics table if it doesn't exist
ALTER TABLE public.clinics 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"availability": {"monday": {"active": true, "start": "10:20", "end": "15:00"}, "wednesday": {"active": true, "start": "14:20", "end": "20:00"}, "friday": {"active": true, "start": "14:20", "end": "20:00"}}}'::jsonb;

-- Comment on column
COMMENT ON COLUMN public.clinics.settings IS 'Stores clinic configuration including availability hours';
