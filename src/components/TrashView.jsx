import React, { useState, useEffect } from 'react';
import { Trash2, RefreshCw, Calendar, Settings } from 'lucide-react';
import { supabase } from '../supabaseClient';
import logger from '../utils/logger';

const TrashView = ({ user }) => {
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'patients'
    const [trashedAppointments, setTrashedAppointments] = useState([]);
    const [trashedPatients, setTrashedPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set()); // For bulk actions

    const fetchTrash = async () => {
        setLoading(true);
        try {
            // Fetch Appointments
            const { data: apts } = await supabase
                .from('appointments')
                .select('*')
                .eq('clinic_id', user.clinicId)
                .eq('status', 'trash')
                .order('appointment_date', { ascending: false });

            if (apts) setTrashedAppointments(apts);

            // Fetch Patients
            const { data: pats } = await supabase
                .from('patients')
                .select('*')
                .eq('clinic_id', user.clinicId)
                .eq('status', 'trash')
                .order('updated_at', { ascending: false });

            if (pats) {
                const mappedPats = pats.map(row => ({ ...row.data, id: row.id, status: row.status }));
                setTrashedPatients(mappedPats);
            }

        } catch (error) {
            logger.error("Error fetching trash:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrash();
    }, []);

    // Reset selection when tab changes
    useEffect(() => {
        setSelectedIds(new Set());
    }, [activeTab]);

    const toggleSelectAll = () => {
        const currentItems = activeTab === 'appointments' ? trashedAppointments : trashedPatients;
        if (selectedIds.size === currentItems.length) {
            setSelectedIds(new Set()); // Deselect all
        } else {
            setSelectedIds(new Set(currentItems.map(i => i.id))); // Select all
        }
    };

    const toggleSelect = (id) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) newSelected.delete(id);
        else newSelected.add(id);
        setSelectedIds(newSelected);
    };

    const restoreSelected = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿Restaurar ${selectedIds.size} elementos seleccionados?`)) return;

        const table = activeTab === 'appointments' ? 'appointments' : 'patients';
        const status = activeTab === 'appointments' ? 'pending' : 'active';

        try {
            const { error } = await supabase
                .from(table)
                .update({ status: status })
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            alert("Elementos restaurados.");
            setSelectedIds(new Set());
            fetchTrash();
        } catch (error) {
            logger.error("Error restoring:", error);
            alert("Error al restaurar.");
        }
    };

    const deleteSelectedPermanently = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`¿ELIMINAR DEFINITIVAMENTE ${selectedIds.size} elementos? ¡Esta acción es IRREVERSIBLE!`)) return;

        const table = activeTab === 'appointments' ? 'appointments' : 'patients';

        try {
            const { error } = await supabase
                .from(table)
                .delete()
                .in('id', Array.from(selectedIds));

            if (error) throw error;

            setSelectedIds(new Set());
            fetchTrash();
        } catch (error) {
            logger.error("Error deleting:", error);
            alert("Error al eliminar.");
        }
    };

    const restoreAppointment = async (id) => {
        if (!confirm("¿Restaurar esta cita?")) return;
        await supabase.from('appointments').update({ status: 'pending' }).eq('id', id);
        fetchTrash();
        alert("Cita restaurada.");
    };

    const deleteAppointmentPermanently = async (id) => {
        if (!confirm("¿Eliminar definitivamente? Esta acción no se puede deshacer.")) return;
        await supabase.from('appointments').delete().eq('id', id);
        fetchTrash();
    };

    const restorePatient = async (id) => {
        if (!confirm("¿Restaurar este paciente?")) return;
        await supabase.from('patients').update({ status: 'active' }).eq('id', id);
        fetchTrash();
        alert("Paciente restaurado.");
    };

    const deletePatientPermanently = async (id) => {
        if (!confirm("¿Eliminar definitivamente al paciente y todo su historial? ¡Esta acción es IRREVERSIBLE!")) return;
        await supabase.from('patients').delete().eq('id', id);
        fetchTrash();
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-red-900 flex items-center text-lg"><Trash2 className="w-5 h-5 mr-2" /> Papelera de Reciclaje</h4>
                <button onClick={fetchTrash} className="text-sm text-blue-600 hover:underline flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Actualizar</button>
            </div>

            <div className="flex border-b border-gray-200 mb-4">
                <button
                    onClick={() => setActiveTab('appointments')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'appointments' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Citas Eliminadas ({trashedAppointments.length})
                </button>
                <button
                    onClick={() => setActiveTab('patients')}
                    className={`px-4 py-2 font-bold text-sm ${activeTab === 'patients' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Pacientes Eliminados ({trashedPatients.length})
                </button>
            </div>

            {/* Bulk Actions Toolbar */}
            <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded border border-gray-200">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={(activeTab === 'appointments' ? trashedAppointments : trashedPatients).length > 0 && selectedIds.size === (activeTab === 'appointments' ? trashedAppointments : trashedPatients).length}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    Seleccionar Todos
                </label>

                {selectedIds.size > 0 && (
                    <div className="flex gap-2">
                        <button onClick={restoreSelected} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-bold shadow-sm flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" /> Restaurar ({selectedIds.size})
                        </button>
                        <button onClick={deleteSelectedPermanently} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-bold shadow-sm flex items-center">
                            <Trash2 className="w-3 h-3 mr-1" /> Eliminar ({selectedIds.size})
                        </button>
                    </div>
                )}
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div> : (
                    <>
                        {activeTab === 'appointments' && (
                            trashedAppointments.length === 0 ? <p className="text-center text-gray-400 italic py-8">No hay citas en la papelera.</p> : (
                                <div className="space-y-2">
                                    {trashedAppointments.map(item => (
                                        <div key={item.id} className={`p-3 rounded border flex justify-between items-center hover:shadow-sm transition-shadow ${selectedIds.has(item.id) ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.patient_name}</p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-2">
                                                        <Calendar className="w-3 h-3" /> {new Date(item.appointment_date).toLocaleString()}
                                                    </p>
                                                    {item.symptoms && <p className="text-xs text-gray-400 italic mt-1">"{item.symptoms}"</p>}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => restoreAppointment(item.id)} className="text-xs bg-white text-green-700 px-3 py-1 rounded hover:bg-green-50 font-bold border border-green-200">Restaurar</button>
                                                <button onClick={() => deleteAppointmentPermanently(item.id)} className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 font-bold border border-red-200">Eliminar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {activeTab === 'patients' && (
                            trashedPatients.length === 0 ? <p className="text-center text-gray-400 italic py-8">No hay pacientes en la papelera.</p> : (
                                <div className="space-y-2">
                                    {trashedPatients.map(item => (
                                        <div key={item.id} className={`p-3 rounded border flex justify-between items-center hover:shadow-sm transition-shadow ${selectedIds.has(item.id) ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-100'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedIds.has(item.id)}
                                                    onChange={() => toggleSelect(item.id)}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                />
                                                <div>
                                                    <p className="font-bold text-gray-800">{item.nombre}</p>
                                                    <p className="text-xs text-gray-500">DNI: {item.id} | {item.edad} {(!item.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => restorePatient(item.id)} className="text-xs bg-white text-green-700 px-3 py-1 rounded hover:bg-green-50 font-bold border border-green-200">Restaurar</button>
                                                <button onClick={() => deletePatientPermanently(item.id)} className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 font-bold border border-red-200">Eliminar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default TrashView;
