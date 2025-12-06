-- SOLUCIÓN FINAL PARA BORRAR USUARIOS
-- El problema es que la columna 'user_id' está marcada como "NOT NULL" (obligatoria).
-- Por eso, aunque le digamos "ponlo en NULL al borrar", la base de datos dice "¡No puedo, es obligatorio!".

-- PASO 1: Permitir que 'user_id' pueda estar vacío (NULL)
ALTER TABLE patients ALTER COLUMN user_id DROP NOT NULL;

-- PASO 2: Asegurar que la regla de borrado sea la correcta (SET NULL)
ALTER TABLE patients
DROP CONSTRAINT IF EXISTS patients_user_id_fkey;

ALTER TABLE patients
ADD CONSTRAINT patients_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE SET NULL;

-- PASO 3: Lo mismo para la tabla de perfiles (profiles)
-- Si borras el usuario, el perfil se debe borrar (CASCADE) porque no tiene sentido un perfil sin usuario.
-- Esto ya debería estar así, pero por si acaso:
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;
