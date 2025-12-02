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
ADD COLUMN IF NOT EXISTS patient_dob date;

-- Comentario para verificar que se ejecutó
COMMENT ON COLUMN appointments.patient_dni IS 'DNI del paciente para pre-llenado';
