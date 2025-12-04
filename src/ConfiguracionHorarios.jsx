
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { supabase } from './supabaseClient';
import logger from './utils/logger';

// --- COMPONENTE DE CONFIGURACIÓN DE HORARIOS ---
const ConfiguracionHorarios = ({ clinicId }) => {
    const [settings, setSettings] = useState({
        availability: {
            monday: { active: true, start: "10:20", end: "15:00" },
            tuesday: { active: false, start: "09:00", end: "18:00" },
            wednesday: { active: true, start: "14:20", end: "20:00" },
            thursday: { active: false, start: "09:00", end: "18:00" },
            friday: { active: true, start: "14:20", end: "20:00" },
            saturday: { active: false, start: "09:00", end: "13:00" },
            sunday: { active: false, start: "09:00", end: "13:00" }
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, [clinicId]);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('clinics')
                .select('settings')
                .eq('id', clinicId)
                .single();

            if (error) throw error;

            if (data?.settings?.availability) {
                setSettings(prev => ({
                    ...prev,
                    availability: { ...prev.availability, ...data.settings.availability }
                }));
            }
        } catch (err) {
            logger.error("Error fetching settings:", err);
            // Fallback to defaults if column doesn't exist or is empty
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // First get existing settings to merge
            const { data: existing } = await supabase
                .from('clinics')
                .select('settings')
                .eq('id', clinicId)
                .single();

            const newSettings = {
                ...(existing?.settings || {}),
                availability: settings.availability
            };

            const { error } = await supabase
                .from('clinics')
                .update({ settings: newSettings })
                .eq('id', clinicId);

            if (error) throw error;
            alert("Configuración guardada exitosamente.");
        } catch (err) {
            logger.error("Error saving settings:", err);
            alert("Error al guardar la configuración. Asegúrate de haber ejecutado la migración de base de datos.");
        } finally {
            setSaving(false);
        }
    };

    const days = [
        { key: 'monday', label: 'Lunes' },
        { key: 'tuesday', label: 'Martes' },
        { key: 'wednesday', label: 'Miércoles' },
        { key: 'thursday', label: 'Jueves' },
        { key: 'friday', label: 'Viernes' },
        { key: 'saturday', label: 'Sábado' },
        { key: 'sunday', label: 'Domingo' }
    ];

    if (loading) return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;

    return (
        <div className="space-y-6">
            <div className="grid gap-4">
                {days.map(day => {
                    const config = settings.availability[day.key] || { active: false, start: "09:00", end: "18:00" };
                    return (
                        <div key={day.key} className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${config.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-75'}`}>
                            <div className="w-32">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className={`w-10 h-6 rounded-full p-1 transition-colors ${config.active ? 'bg-green-500' : 'bg-slate-300'}`}>
                                        <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${config.active ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                    <input
                                        type="checkbox"
                                        className="hidden"
                                        checked={config.active}
                                        onChange={e => {
                                            setSettings(prev => ({
                                                ...prev,
                                                availability: {
                                                    ...prev.availability,
                                                    [day.key]: { ...config, active: e.target.checked }
                                                }
                                            }));
                                        }}
                                    />
                                    <span className={`font-bold ${config.active ? 'text-slate-800' : 'text-slate-500'}`}>{day.label}</span>
                                </label>
                            </div>

                            {config.active && (
                                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-bold uppercase">Desde:</span>
                                        <input
                                            type="time"
                                            value={config.start}
                                            onChange={e => {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    availability: {
                                                        ...prev.availability,
                                                        [day.key]: { ...config, start: e.target.value }
                                                    }
                                                }));
                                            }}
                                            className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <span className="text-slate-300 mx-2">→</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-400 font-bold uppercase">Hasta:</span>
                                        <input
                                            type="time"
                                            value={config.end}
                                            onChange={e => {
                                                setSettings(prev => ({
                                                    ...prev,
                                                    availability: {
                                                        ...prev.availability,
                                                        [day.key]: { ...config, end: e.target.value }
                                                    }
                                                }));
                                            }}
                                            className="border border-slate-200 rounded-lg px-2 py-1 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {saving ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" /> Guardando...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" /> Guardar Cambios
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default ConfiguracionHorarios;
