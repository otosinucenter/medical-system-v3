-- AGREGAR COLUMNAS DE DATOS DEL PACIENTE A LA TABLA DE CITAS
-- Esto es necesario para que los datos importados o del formulario público se guarden correctamente
-- y puedan ser cargados al momento de "Atender".

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS patient_dni text,
ADD COLUMN IF NOT EXISTS patient_age text,
ADD COLUMN IF NOT EXISTS patient_sex text,
ADD COLUMN IF NOT EXISTS patient_occupation text,
ADD COLUMN IF NOT EXISTS patient_district text,
ADD COLUMN IF NOT EXISTS patient_email text,
ADD COLUMN IF NOT EXISTS patient_dob date,
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS referral_detail text,
ADD COLUMN IF NOT EXISTS chronic_illnesses text,
ADD COLUMN IF NOT EXISTS medications text,
ADD COLUMN IF NOT EXISTS allergies text,
ADD COLUMN IF NOT EXISTS surgeries text,
ADD COLUMN IF NOT EXISTS patient_reason text;

-- Comentario para verificar que se ejecutó
COMMENT ON COLUMN appointments.patient_dni IS 'DNI del paciente para pre-llenado';
COMMENT ON COLUMN appointments.referral_source IS 'Fuente de referencia (Redes, Recomendación, etc.)';
COMMENT ON COLUMN appointments.patient_reason IS 'Motivo de consulta para pre-llenado';
