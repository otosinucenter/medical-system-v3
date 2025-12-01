-- SOLUCIÓN "NUCLEAR" PARA DESBLOQUEAR EL BORRADO ☢️
-- Este script arregla las dos tablas que suelen bloquear a los usuarios: Profiles y Patients.

-- 1. ARREGLAR PERFILES (Profiles)
-- El perfil debe borrarse automáticamente si borras el usuario.
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. ARREGLAR PACIENTES (Patients)
-- Los pacientes deben quedarse (sin dueño) si borras el usuario.
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;
ALTER TABLE patients
ADD CONSTRAINT patients_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- 3. ARREGLAR CITAS (Appointments) - Por si acaso
-- Las citas no deberían bloquear, pero aseguramos.
-- (Las citas están ligadas al consultorio, no al usuario directo, así que esto es preventivo)
