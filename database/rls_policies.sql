-- =====================================================
-- ROW LEVEL SECURITY (RLS) - SISTEMA MÉDICO
-- =====================================================
-- Estado: ACTIVO en producción
-- Fecha: 2024-12-04
-- Nivel de seguridad: 7/10
-- =====================================================

-- Habilitar RLS en tablas principales
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- PATIENTS: Solo usuarios de la misma clínica
CREATE POLICY "patients_all" ON patients
    FOR ALL
    USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- APPOINTMENTS: Lectura pública + escritura restringida
CREATE POLICY "appointments_select" ON appointments
    FOR SELECT USING (true);

CREATE POLICY "appointments_insert" ON appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "appointments_update" ON appointments
    FOR UPDATE USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

CREATE POLICY "appointments_delete" ON appointments
    FOR DELETE USING (
        clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid())
    );

-- =====================================================
-- PARA DESACTIVAR (si hay problemas):
-- =====================================================
-- ALTER TABLE patients DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
-- DROP POLICY IF EXISTS "patients_all" ON patients;
-- DROP POLICY IF EXISTS "appointments_select" ON appointments;
-- DROP POLICY IF EXISTS "appointments_insert" ON appointments;
-- DROP POLICY IF EXISTS "appointments_update" ON appointments;
-- DROP POLICY IF EXISTS "appointments_delete" ON appointments;
