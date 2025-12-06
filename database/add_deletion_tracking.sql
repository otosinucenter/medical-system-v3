-- Add columns to track deletion information
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS deleted_from text;

COMMENT ON COLUMN appointments.deleted_at IS 'Timestamp when the appointment was deleted';
COMMENT ON COLUMN appointments.deleted_from IS 'View/section from where the appointment was deleted (Agenda v1, Agenda v2, Triaje, etc)';
