-- =====================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS) - SISTEMA MÉDICO
-- =====================================================
-- Ejecutar este script en: Supabase Dashboard → SQL Editor
-- Fecha: 2024-12-04
-- NOTA: Se removió clinic_settings porque no existe esa tabla
-- =====================================================

-- =====================================================
-- PASO 1: HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PASO 2: POLÍTICAS PARA TABLA 'patients'
-- =====================================================

CREATE POLICY "patients_select_clinic" ON public.patients
    FOR SELECT
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "patients_insert_clinic" ON public.patients
    FOR INSERT
    WITH CHECK (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "patients_update_clinic" ON public.patients
    FOR UPDATE
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "patients_delete_clinic" ON public.patients
    FOR DELETE
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- PASO 3: POLÍTICAS PARA TABLA 'appointments'
-- =====================================================

CREATE POLICY "appointments_select_clinic" ON public.appointments
    FOR SELECT
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
        OR
        auth.uid() IS NULL
    );

CREATE POLICY "appointments_insert_public" ON public.appointments
    FOR INSERT
    WITH CHECK (
        (auth.uid() IS NOT NULL AND clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        ))
        OR
        auth.uid() IS NULL
    );

CREATE POLICY "appointments_update_clinic" ON public.appointments
    FOR UPDATE
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "appointments_delete_clinic" ON public.appointments
    FOR DELETE
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
    );

-- =====================================================
-- PASO 4: POLÍTICAS PARA TABLA 'clinics'
-- =====================================================

CREATE POLICY "clinics_select_own" ON public.clinics
    FOR SELECT
    USING (
        id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid()
        )
        OR
        auth.uid() IS NULL
    );

CREATE POLICY "clinics_update_admin" ON public.clinics
    FOR UPDATE
    USING (
        id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- PASO 5: POLÍTICAS PARA TABLA 'profiles'
-- =====================================================

CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (id = auth.uid());

CREATE POLICY "profiles_select_clinic_admin" ON public.profiles
    FOR SELECT
    USING (
        clinic_id = (
            SELECT clinic_id FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );
