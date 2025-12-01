-- Fix: Allow clinic members to delete appointments
-- Previously, only SELECT and UPDATE were allowed, preventing deletion.

CREATE POLICY "Clinic members can delete appointments" ON appointments
  FOR DELETE USING (
    clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
  );
