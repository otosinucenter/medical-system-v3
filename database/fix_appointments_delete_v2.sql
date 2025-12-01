-- FIX: Permitir eliminar citas a los miembros del consultorio
-- Actualmente solo se puede insertar, ver y actualizar. Falta DELETE.

DROP POLICY IF EXISTS "Clinic members can delete appointments" ON appointments;

CREATE POLICY "Clinic members can delete appointments" ON appointments
  FOR DELETE USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );
