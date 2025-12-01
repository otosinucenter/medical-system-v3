-- ACTUALIZACIÓN PARA TRIAJE Y LISTA
-- Agrega campos para gestión de pagos, exámenes y ordenamiento

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS payment_status text DEFAULT 'pending', -- 'pending', 'paid', 'not_paid'
ADD COLUMN IF NOT EXISTS complementary_exams text, -- Detalle de exámenes
ADD COLUMN IF NOT EXISTS queue_order serial, -- Para ordenar la lista (simple integer)
ADD COLUMN IF NOT EXISTS triage_status text DEFAULT 'pending'; -- 'pending', 'confirmed', 'arrived', 'attended'

-- Crear índice para búsquedas rápidas por fecha (si no existe)
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
