-- Eliminar citas del día 1/12/2025 para limpiar la agenda
DELETE FROM appointments 
WHERE appointment_date >= '2025-12-01 00:00:00' 
  AND appointment_date <= '2025-12-01 23:59:59';
