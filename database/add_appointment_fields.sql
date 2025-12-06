-- AGREGAR CAMPOS DETALLADOS A LA TABLA DE CITAS
-- Ejecuta esto para poder guardar toda la información del nuevo formulario.

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS patient_dni text,
ADD COLUMN IF NOT EXISTS patient_age text,
ADD COLUMN IF NOT EXISTS patient_sex text,
ADD COLUMN IF NOT EXISTS patient_occupation text,
ADD COLUMN IF NOT EXISTS patient_district text,
ADD COLUMN IF NOT EXISTS patient_email text,
ADD COLUMN IF NOT EXISTS patient_dob text, -- Fecha de nacimiento
ADD COLUMN IF NOT EXISTS chronic_illnesses text, -- Enfermedades crónicas
ADD COLUMN IF NOT EXISTS medications text, -- Medicamentos frecuentes
ADD COLUMN IF NOT EXISTS allergies text, -- Alergias
ADD COLUMN IF NOT EXISTS surgeries text, -- Cirugías previas
ADD COLUMN IF NOT EXISTS referral_source text, -- ¿Cómo nos encontró?
ADD COLUMN IF NOT EXISTS referral_detail text; -- Detalle (nombre de quien recomendó, etc.)
