import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

/**
 * Custom hook for managing appointments
 * Centralizes all appointment-related operations
 */
export function useAppointments(clinicId, view, selectedDate) {
    const [appointments, setAppointments] = useState([]);
    const [dailyList, setDailyList] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch appointments based on view
    const fetchAppointments = useCallback(async () => {
        if (!clinicId) return;

        setLoading(true);
        try {
            let query = supabase
                .from('appointments')
                .select('*')
                .eq('clinic_id', clinicId)
                .neq('status', 'trash')
                .order('appointment_date', { ascending: true });

            const { data, error } = await query;

            if (error) throw error;

            setAppointments(data || []);
        } catch (error) {
            logger.error("Error fetching appointments:", error);
        } finally {
            setLoading(false);
        }
    }, [clinicId]);

    // Fetch daily list for triage
    const fetchDailyAppointments = useCallback(async () => {
        if (!clinicId || !selectedDate) return;

        try {
            const startOfDay = new Date(`${selectedDate}T00:00:00`).toISOString();
            const endOfDay = new Date(`${selectedDate}T23:59:59.999`).toISOString();

            const { data, error } = await supabase
                .from('appointments')
                .select('*')
                .eq('clinic_id', clinicId)
                .gte('appointment_date', startOfDay)
                .lte('appointment_date', endOfDay)
                .neq('status', 'trash')
                .order('appointment_date', { ascending: true });

            if (error) throw error;

            setDailyList(data || []);
        } catch (error) {
            logger.error("Error fetching daily list:", error);
        }
    }, [clinicId, selectedDate]);

    // Update appointment field
    const updateAppointmentField = useCallback(async (id, field, value) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ [field]: value })
                .eq('id', id);

            if (error) throw error;

            // Optimistic update
            setAppointments(prev =>
                prev.map(apt => apt.id === id ? { ...apt, [field]: value } : apt)
            );
            setDailyList(prev =>
                prev.map(apt => apt.id === id ? { ...apt, [field]: value } : apt)
            );

            return { success: true };
        } catch (error) {
            logger.error(`Error updating ${field}:`, error);
            return { success: false, error };
        }
    }, []);

    // Delete appointment (soft delete)
    const deleteAppointment = useCallback(async (id) => {
        try {
            // Optimistic update
            setAppointments(prev => prev.filter(apt => apt.id !== id));
            setDailyList(prev => prev.filter(apt => apt.id !== id));

            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'trash',
                    deleted_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            logger.error("Error deleting appointment:", error);
            // Revert on error
            fetchAppointments();
            fetchDailyAppointments();
            return { success: false, error };
        }
    }, [fetchAppointments, fetchDailyAppointments]);

    // Bulk delete
    const bulkDeleteAppointments = useCallback(async (ids) => {
        try {
            // Optimistic update
            setAppointments(prev => prev.filter(apt => !ids.includes(apt.id)));
            setDailyList(prev => prev.filter(apt => !ids.includes(apt.id)));

            const { error } = await supabase
                .from('appointments')
                .update({
                    status: 'trash',
                    deleted_at: new Date().toISOString()
                })
                .in('id', ids);

            if (error) throw error;

            return { success: true };
        } catch (error) {
            logger.error("Error bulk deleting:", error);
            // Revert
            fetchAppointments();
            fetchDailyAppointments();
            return { success: false, error };
        }
    }, [fetchAppointments, fetchDailyAppointments]);

    // Auto-fetch on mount and when dependencies change
    useEffect(() => {
        if (view === 'agenda' || view === 'agenda-v2') {
            fetchAppointments();
        }
    }, [view, fetchAppointments]);

    useEffect(() => {
        if (view === 'triage') {
            fetchDailyAppointments();
        }
    }, [view, selectedDate, fetchDailyAppointments]);

    return {
        appointments,
        dailyList,
        loading,
        fetchAppointments,
        fetchDailyAppointments,
        updateAppointmentField,
        deleteAppointment,
        bulkDeleteAppointments
    };
}
