-- SOLUCIÓN DEFINITIVA PARA ERROR AL BORRAR USUARIO

-- 1. Primero, quitamos la obligación de que el paciente tenga un usuario asignado.
-- Esto es CRÍTICO. Si esto no se ejecuta, el borrado fallará.
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;

-- 2. Eliminamos la restricción antigua que causa el error.
ALTER TABLE patients DROP CONSTRAINT IF EXISTS patients_user_id_fkey;

-- 3. Creamos la nueva restricción segura.
-- ON DELETE SET NULL: Si borras el usuario, el campo user_id se pone en blanco.
ALTER TABLE patients
ADD CONSTRAINT patients_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- 4. Verificación (Opcional)
-- Si esto corre sin errores (Success), ya deberías poder borrar el usuario.
