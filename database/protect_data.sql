-- PROTECCIÓN DE DATOS DE PACIENTES
-- Ejecuta esto en el SQL Editor de Supabase para evitar que los pacientes se borren al eliminar un usuario.

-- 1. Intentar eliminar la restricción (foreign key) que causa el borrado en cadena.
-- Nota: El nombre 'patients_user_id_fkey' es el estándar. Si te da error, puede que tenga otro nombre.
ALTER TABLE patients
DROP CONSTRAINT IF EXISTS patients_user_id_fkey;

-- 2. Volver a crear la relación pero SEGURA (ON DELETE SET NULL).
-- Esto significa: Si borras el usuario de Authentication, el campo 'user_id' del paciente
-- se pondrá en blanco (NULL), pero la fila del paciente NO se borrará.
ALTER TABLE patients
ADD CONSTRAINT patients_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- 3. Asegurar que la tabla de citas (appointments) también sea segura
ALTER TABLE appointments
DROP CONSTRAINT IF EXISTS appointments_clinic_id_fkey;

ALTER TABLE appointments
ADD CONSTRAINT appointments_clinic_id_fkey
FOREIGN KEY (clinic_id) REFERENCES clinics(id)
ON DELETE CASCADE; 
-- Nota: En citas, si borras el CONSULTORIO, sí se borran las citas. 
-- Pero borrar un USUARIO no borra el consultorio, así que es seguro.
