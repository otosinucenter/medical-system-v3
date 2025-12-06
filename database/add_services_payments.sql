-- SISTEMA DE SERVICIOS Y PAGOS
-- Agrega campos para gestionar servicios médicos seleccionados y pagos

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS services_selected jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS payments jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS total_to_charge decimal(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_paid decimal(10,2) DEFAULT 0;

-- Índice para búsquedas por estado de pago
CREATE INDEX IF NOT EXISTS idx_appointments_payment ON appointments(total_to_charge, total_paid);
