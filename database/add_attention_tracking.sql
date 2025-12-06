-- TRACKING DE DURACIÓN DE CONSULTAS
-- Agrega campos para registrar inicio y fin de atención

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS attention_start_time timestamp with time zone,
ADD COLUMN IF NOT EXISTS attention_end_time timestamp with time zone;

-- Nota: El triage_status ahora puede tener el valor 'in_attention' 
-- para indicar que el paciente está siendo atendido actualmente.
