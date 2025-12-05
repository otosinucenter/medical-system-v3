import React from 'react';
import { Trash2, FileText, Link, RefreshCw, Phone, User, CheckCircle2, X } from 'lucide-react';

const AgendaView = ({
    user,
    appointments,
    setAppointments,
    selectedAppointments,
    showConfirmed,
    showAgendaImportModal,
    setShowAgendaImportModal,
    agendaImportText,
    setAgendaImportText,
    fetchAppointments,
    handleBulkDelete,
    handleSelectAll,
    handleSelectAppointment,
    confirmAppointment,
    deleteAppointment,
    handleAgendaImport,
    supabase,
    logger
}) => {
    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
            <div className="bg-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">BETA v2.0</span>
                        <h2 className="text-2xl font-bold">Agenda Inteligente</h2>
                    </div>
                    <p className="text-indigo-100 max-w-2xl">
                        Esta es una vista experimental para probar la nueva lógica de horarios. Aquí verás las citas agendadas a través del nuevo formulario v2.0.
                    </p>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500 to-transparent opacity-50"></div>
            </div>

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-lg font-bold text-slate-800">Próximas Citas (v2)</h3>
                </div>
                <div className="flex gap-2">
                    {selectedAppointments.length > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar ({selectedAppointments.length})
                        </button>
                    )}
                    <button
                        onClick={() => setShowAgendaImportModal(true)}
                        className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4" />
                        Importar Excel
                    </button>
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/citas-v2/${user.clinicId}`;
                            navigator.clipboard.writeText(link);
                            alert("Link de citas v2 copiado al portapapeles");
                        }}
                        className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2"
                    >
                        <Link className="w-4 h-4" />
                        Copiar Link v2.0
                    </button>
                    <button
                        onClick={fetchAppointments}
                        className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Reutilizamos la tabla de citas por ahora, pero filtrada o destacada */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            <th className="p-4 w-12">
                                <input
                                    type="checkbox"
                                    onChange={(e) => handleSelectAll(e, appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed')))}
                                    checked={appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed')).length > 0 && selectedAppointments.length === appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed')).length}
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                            </th>
                            <th className="p-4 w-48">Fecha / Hora</th>
                            <th className="p-4">Paciente</th>
                            <th className="p-4">Motivo / Antecedentes</th>
                            <th className="p-4 w-32 text-center">Estado</th>
                            <th className="p-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed')).map((apt) => (
                            <tr key={apt.id} className={`hover:bg-indigo-50/30 transition-colors group ${apt.status === 'confirmed' ? 'bg-green-50/50' : ''}`}>
                                {/* CHECKBOX */}
                                <td className="p-4 align-top">
                                    <input
                                        type="checkbox"
                                        checked={selectedAppointments.includes(apt.id)}
                                        onChange={() => handleSelectAppointment(apt.id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2"
                                    />
                                </td>
                                {/* FECHA Y HORA EDITABLE (AUTO-SAVE) */}
                                <td className="p-4 align-top">
                                    <div className="flex flex-col gap-2">
                                        <input
                                            key={`date-v2-${apt.id}-${apt.appointment_date}`}
                                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                            type="date"
                                            className="text-xs font-bold border border-transparent hover:border-indigo-200 focus:border-indigo-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none"
                                            defaultValue={new Date(apt.appointment_date).toISOString().split('T')[0]}
                                            onBlur={(e) => {
                                                // Logic duplicated for simplicity in prototype
                                                const newDate = e.target.value;
                                                if (newDate && newDate !== new Date(apt.appointment_date).toISOString().split('T')[0]) {
                                                    const newDateTime = new Date(`${newDate}T${new Date(apt.appointment_date).toTimeString().slice(0, 5)}`).toISOString();
                                                    setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));
                                                    supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                                        if (error) logger.error(error);
                                                        fetchAppointments();
                                                    });
                                                }
                                            }}
                                        />
                                        <input
                                            key={`time-v2-${apt.id}-${apt.appointment_date}`}
                                            onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                            type="time"
                                            className="text-lg font-bold border border-transparent hover:border-indigo-200 focus:border-indigo-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none text-slate-800"
                                            defaultValue={new Date(apt.appointment_date).toTimeString().slice(0, 5)}
                                            onBlur={(e) => {
                                                const newTime = e.target.value;
                                                // Fix: Use local date, not UTC date, to avoid shifting days
                                                const localDate = new Date(apt.appointment_date);
                                                localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
                                                const currentDate = localDate.toISOString().split('T')[0];

                                                const currentTime = new Date(apt.appointment_date).toTimeString().slice(0, 5);
                                                if (newTime && newTime !== currentTime) {
                                                    // Construct new date in local time, then convert to UTC
                                                    const newDateTime = new Date(`${currentDate}T${newTime}:00`).toISOString();
                                                    setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));
                                                    supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                                        if (error) { logger.error(error); fetchAppointments(); }
                                                    });
                                                }
                                            }}
                                        />
                                    </div>
                                </td>

                                {/* DATOS PACIENTE */}
                                <td className="p-4 align-top">
                                    <div className="font-bold text-slate-800 text-sm">{apt.patient_name}</div>
                                    <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                                        {apt.patient_phone && (
                                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                <Phone className="w-3 h-3" /> {apt.patient_phone}
                                            </span>
                                        )}
                                        {apt.patient_age && (
                                            <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                                <User className="w-3 h-3" /> {apt.patient_age}
                                            </span>
                                        )}
                                    </div>
                                </td>

                                {/* MOTIVO */}
                                <td className="p-4 align-top">
                                    {apt.symptoms ? (
                                        <div className="text-sm text-slate-600 italic bg-indigo-50/50 p-2 rounded border border-indigo-100/50 max-w-xs">
                                            "{apt.symptoms}"
                                        </div>
                                    ) : (
                                        <span className="text-xs text-gray-300 italic">Sin motivo especificado</span>
                                    )}
                                </td>

                                {/* ESTADO */}
                                <td className="p-4 align-top text-center">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                    </span>
                                </td>

                                {/* ACCIONES */}
                                <td className="p-4 align-top text-right">
                                    <div className="flex justify-end items-center gap-2">
                                        {apt.status !== 'confirmed' && (
                                            <button
                                                onClick={() => confirmAppointment(apt)}
                                                className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                                title="Confirmar y Mover a Triaje"
                                            >
                                                <CheckCircle2 className="w-5 h-5" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => deleteAppointment(apt.id)}
                                            className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                            title="Eliminar Solicitud"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* IMPORT MODAL */}
            {showAgendaImportModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                            <h3 className="font-bold text-lg flex items-center"><FileText className="w-5 h-5 mr-2" /> Importar desde Excel</h3>
                            <button onClick={() => setShowAgendaImportModal(false)} className="hover:text-green-100"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-gray-600 mb-4">
                                Copia las filas de tu Excel y pégalas aquí. El sistema detectará automáticamente fechas, horas y datos del paciente.
                            </p>
                            <textarea
                                value={agendaImportText}
                                onChange={(e) => setAgendaImportText(e.target.value)}
                                placeholder={`Ejemplo:\n3/12/2025\t2.2\tMotivo...\tDNI...\tNombre...`}
                                className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
                            />
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowAgendaImportModal(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleAgendaImport}
                                    disabled={!agendaImportText.trim()}
                                    className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    Procesar Importación
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaView;
