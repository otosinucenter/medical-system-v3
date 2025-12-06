-- Add status column to patients table for soft delete
ALTER TABLE patients ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- Update RLS policies to allow updating status (if not already covered by "update own patients")
-- The existing policy "Clinic members can update patients" should cover this, 
-- but we might need to ensure "select" policies filter out 'trash' by default 
-- OR we handle filtering in the frontend (which is often easier for "Trash" views).
-- For now, we'll handle filtering in the frontend query.
