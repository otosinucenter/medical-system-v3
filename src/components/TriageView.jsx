import React, { useState } from 'react';
import { Clipboard, Trash2, RefreshCw, Calendar, CheckCircle2, X, Edit3, Phone, Info, ArrowRight, DollarSign, Plus } from 'lucide-react';

const TriageView = ({
    user,
    dailyList,
    selectedDate,
    onDateChange,
    fetchDailyAppointments,
    selectedTriageItems,
    onSelectTriageItems,
    onTriageBulkDelete,
    onTriageSelectAll,
    editingAppointment,
    setEditingAppointment,
    onSaveTime,
    onUpdateAppointmentField,
    onUpdateTriageStatus,
    onConvertToPatient,
    onAddPayment,
    onDeletePayment,
    metodosPago
}) => {
    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                        <Clipboard className="w-6 h-6 mr-2 text-blue-600" />
                        Triaje y Admisión
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Gestiona el flujo de pacientes del día.</p>
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    {selectedTriageItems.length > 0 && (
                        <button
                            onClick={onTriageBulkDelete}
                            className="flex-1 sm:flex-none bg-red-50 text-red-600 px-4 py-2.5 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                        >
                            <Trash2 className="w-4 h-4" />
                            Eliminar ({selectedTriageItems.length})
                        </button>
                    )}
                    <button
                        onClick={fetchDailyAppointments}
                        className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" /> Actualizar
                    </button>
                </div>
            </div>

            {/* Date Selector & List Header */}
            <div className="flex flex-col sm:flex-row justify-between items-end sm:items-center gap-4 px-2">
                <div className="flex items-center gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fecha:</span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => onDateChange(e.target.value)}
                            className="bg-transparent border-none p-0 text-slate-700 font-bold focus:ring-0 cursor-pointer"
                        />
                    </div>
                </div>

                {dailyList.length > 0 && (
                    <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors">
                        <input
                            type="checkbox"
                            onChange={(e) => onTriageSelectAll(e, dailyList)}
                            checked={dailyList.length > 0 && selectedTriageItems.length === dailyList.length}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                        />
                        <span className="text-xs font-bold text-slate-600">Seleccionar Todos</span>
                    </label>
                )}
            </div>

            {/* Cards List */}
            <div className="space-y-4">
                {dailyList.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No hay citas programadas para este día.</p>
                    </div>
                ) : (
                    [...dailyList].sort((a, b) => {
                        // Helper: Check if attended within last 1 minute (stays at top)
                        const isRecentlyAttended = (item) => {
                            if (item.triage_status !== 'attended' || !item.attention_end_time) return false;
                            const endTime = new Date(item.attention_end_time).getTime();
                            const now = Date.now();
                            return (now - endTime) < 60000; // 60 seconds
                        };

                        // Priority order: in_attention > recently_attended > arrived_ontime > arrived_late > on_way > confirmed > no_response > pending > cancelled > attended(old)
                        const getPriority = (item) => {
                            if (item.triage_status === 'in_attention') return 0;
                            if (isRecentlyAttended(item)) return 1; // Recently attended stays near top
                            const priorities = {
                                'arrived_ontime': 2,
                                'arrived_late': 3,
                                'on_way': 4,
                                'confirmed': 5,
                                'no_response': 6,
                                'pending': 7,
                                undefined: 7,
                                null: 7,
                                '': 7,
                                'cancelled': 8,
                                'attended': 9 // Old attended goes to bottom
                            };
                            return priorities[item.triage_status] ?? 7;
                        };

                        const aPriority = getPriority(a);
                        const bPriority = getPriority(b);
                        if (aPriority !== bPriority) return aPriority - bPriority;
                        // Same priority: sort by appointment time
                        return new Date(a.appointment_date) - new Date(b.appointment_date);
                    }).map((p, index) => {
                        // Check if this patient was recently attended (within 1 minute)
                        const isRecentlyAttended = p.triage_status === 'attended' && p.attention_end_time &&
                            (Date.now() - new Date(p.attention_end_time).getTime()) < 60000;

                        // Calculate duration if both times exist
                        const getDuration = () => {
                            if (!p.attention_start_time || !p.attention_end_time) return null;
                            const start = new Date(p.attention_start_time).getTime();
                            const end = new Date(p.attention_end_time).getTime();
                            const minutes = Math.round((end - start) / 60000);
                            return minutes;
                        };
                        const duration = getDuration();

                        return (
                            <div
                                key={p.id}
                                className={`
                                group relative bg-white rounded-2xl border transition-all duration-300
                                ${p.triage_status === 'in_attention' ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-300 shadow-xl animate-pulse' : ''}
                                ${p.triage_status === 'attended' && !isRecentlyAttended ? 'border-emerald-200 bg-emerald-50/30 opacity-60' : ''}
                                ${p.triage_status === 'attended' && isRecentlyAttended ? 'border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-200' : ''}
                                ${p.triage_status === 'arrived_ontime' ? 'border-green-300 bg-green-50/50 ring-2 ring-green-200 shadow-lg' : ''}
                                ${p.triage_status === 'arrived_late' ? 'border-yellow-300 bg-yellow-50/40 ring-1 ring-yellow-200' : ''}
                                ${p.triage_status === 'on_way' ? 'border-purple-200 bg-purple-50/30' : ''}
                                ${p.triage_status === 'no_response' ? 'border-orange-200 bg-orange-50/30' : ''}
                                ${p.triage_status === 'cancelled' ? 'border-red-200 bg-red-50/30 opacity-50' : ''}
                                ${p.triage_status === 'confirmed' ? 'border-blue-200 bg-blue-50/20' : ''}
                                ${!p.triage_status || p.triage_status === 'pending' ? 'border-slate-100 hover:border-blue-200 hover:shadow-md' : ''}
                            `}
                            >
                                {/* Selection Checkbox (Absolute) */}
                                <div className="absolute top-4 left-4 z-10">
                                    <input
                                        type="checkbox"
                                        checked={selectedTriageItems.includes(p.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                onSelectTriageItems([...selectedTriageItems, p.id]);
                                            } else {
                                                onSelectTriageItems(selectedTriageItems.filter(id => id !== p.id));
                                            }
                                        }}
                                        className="w-5 h-5 text-blue-600 rounded-md border-gray-300 focus:ring-blue-500 cursor-pointer shadow-sm"
                                    />
                                </div>

                                <div className="flex flex-col md:flex-row">
                                    {/* Left Column: Time & Order */}
                                    <div className="p-5 md:w-48 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center gap-2 border-b md:border-b-0 md:border-r border-slate-100 bg-slate-50/50 rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none pl-12 md:pl-6">
                                        <div className="text-center md:text-left">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hora Cita</span>
                                            {editingAppointment?.id === p.id ? (
                                                <div className="flex flex-col gap-2 bg-white p-2 rounded-lg shadow-sm border border-blue-200">
                                                    <input
                                                        type="time"
                                                        value={editingAppointment.time}
                                                        onChange={e => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                                                        onKeyDown={(e) => e.key === 'Enter' && onSaveTime()}
                                                        className="text-lg font-bold text-blue-600 border-none p-0 focus:ring-0 w-full text-center"
                                                    />
                                                    <div className="flex gap-1 justify-center">
                                                        <button onClick={onSaveTime} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><CheckCircle2 className="w-4 h-4" /></button>
                                                        <button onClick={() => setEditingAppointment(null)} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => {
                                                        const d = new Date(p.appointment_date);
                                                        setEditingAppointment({
                                                            id: p.id,
                                                            date: d.toISOString().split('T')[0],
                                                            time: d.toTimeString().slice(0, 5)
                                                        });
                                                    }}
                                                    className="text-3xl font-black text-slate-700 hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-2 group/time"
                                                >
                                                    {new Date(p.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                                                    <Edit3 className="w-4 h-4 opacity-0 group-hover/time:opacity-100 text-blue-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="hidden md:block mt-2">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-200 text-slate-600">
                                                #{index + 1}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Middle Column: Patient Info & Details */}
                                    <div className="p-5 flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Patient Identity */}
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-800 leading-tight">{p.patient_name}</h4>
                                                    <div className="flex items-center gap-2 mt-1 text-sm text-slate-500">
                                                        <span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-600">DNI: {p.patient_dni}</span>
                                                        <span>•</span>
                                                        <span>{p.patient_age} {(p.patient_age && !p.patient_age.toLowerCase().includes('años') && !p.patient_age.toLowerCase().includes('meses')) ? 'años' : ''}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                {p.patient_phone ? (() => {
                                                    let phone = p.patient_phone.replace(/\D/g, '');
                                                    // Only add 51 if it's a 9-digit number starting with 9 (Peru mobile)
                                                    if (phone.length === 9 && phone.startsWith('9')) {
                                                        phone = '51' + phone;
                                                    }
                                                    return (
                                                        <a
                                                            href={`https://wa.me/${phone}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-bold border border-green-100 hover:bg-green-100 transition-colors"
                                                        >
                                                            <Phone className="w-3.5 h-3.5" />
                                                            {p.patient_phone}
                                                        </a>
                                                    );
                                                })() : (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-400 text-xs font-bold border border-slate-100">
                                                        <Phone className="w-3.5 h-3.5" />
                                                        Sin celular
                                                    </span>
                                                )}
                                            </div>

                                            {p.symptoms && (
                                                <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                    <p className="text-xs text-slate-500 font-medium uppercase mb-1 flex items-center gap-1">
                                                        <Info className="w-3 h-3" /> Motivo / Síntomas
                                                    </p>
                                                    <p className="text-sm text-slate-700 italic">"{p.symptoms}"</p>
                                                </div>
                                            )}
                                        </div>

                                        {/* Management & Notes */}
                                        <div className="space-y-3">
                                            {/* SERVICIOS Y PAGOS */}
                                            {p.services_selected && p.services_selected.length > 0 ? (
                                                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                                            <DollarSign className="w-3 h-3" /> COBRAR
                                                        </span>
                                                        <span className="text-lg font-bold text-emerald-800">
                                                            S/ {p.total_to_charge || 0}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-1 text-xs text-emerald-700">
                                                        {p.services_selected.map((s, i) => (
                                                            <div key={i} className="flex justify-between">
                                                                <span>{s.nombre}</span>
                                                                <span className={s.precioAcordado === 0 ? 'text-emerald-500 font-bold' : ''}>
                                                                    {s.precioAcordado === 0 ? 'GRATIS' : `S/ ${s.precioAcordado}`}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Payments registered */}
                                                    {p.payments && p.payments.length > 0 && (
                                                        <div className="mt-2 pt-2 border-t border-emerald-200">
                                                            {p.payments.map((pay, i) => (
                                                                <div key={i} className="flex justify-between items-center text-xs text-emerald-600 mb-1 last:mb-0 group/pay">
                                                                    <div className="flex items-center gap-1">
                                                                        <span>{metodosPago?.find(m => m.id === pay.metodo)?.icon || '💰'} {metodosPago?.find(m => m.id === pay.metodo)?.nombre || pay.metodo}</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span>S/ {pay.monto}</span>
                                                                        {onDeletePayment && (
                                                                            <button
                                                                                onClick={() => onDeletePayment(p.id, i)}
                                                                                className="text-red-400 hover:text-red-600 opacity-0 group-hover/pay:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-50"
                                                                                title="Eliminar pago"
                                                                            >
                                                                                <X className="w-3 h-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Payment status */}
                                                    <div className="mt-2 pt-2 border-t border-emerald-200 flex justify-between items-center">
                                                        <span className="text-xs font-medium text-emerald-700">Pagado:</span>
                                                        <span className={`text-sm font-bold ${(p.total_paid || 0) >= (p.total_to_charge || 0) ? 'text-green-600' : 'text-orange-600'}`}>
                                                            S/ {p.total_paid || 0}
                                                            {(p.total_paid || 0) >= (p.total_to_charge || 0) && <span className="ml-1">✅</span>}
                                                        </span>
                                                    </div>

                                                    {/* Add payment button */}
                                                    {onAddPayment && (p.total_paid || 0) < (p.total_to_charge || 0) && (
                                                        <button
                                                            onClick={() => {
                                                                const metodo = prompt('Método de pago:\n1. Efectivo\n2. Yape\n3. Plin\n4. Transferencia\n5. Tarjeta\n\nEscribe el número o nombre:');
                                                                if (!metodo) return;
                                                                const metodoMap = { '1': 'efectivo', '2': 'yape', '3': 'plin', '4': 'transferencia', '5': 'tarjeta' };
                                                                const metodoId = metodoMap[metodo] || metodo.toLowerCase();
                                                                const monto = parseFloat(prompt('Monto pagado (S/):'));
                                                                if (!monto || isNaN(monto)) return;
                                                                onAddPayment(p.id, metodoId, monto);
                                                            }}
                                                            className="w-full mt-2 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors flex items-center justify-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" /> Registrar Pago
                                                        </button>
                                                    )}
                                                </div>
                                            ) : (
                                                /* Old payment toggle for appointments without services */
                                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                                                    <label className="flex items-center gap-2 cursor-pointer select-none">
                                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${p.payment_status === 'paid' ? 'bg-green-500 border-green-500' : 'bg-white border-slate-300'}`}>
                                                            {p.payment_status === 'paid' && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                        </div>
                                                        <input
                                                            type="checkbox"
                                                            checked={p.payment_status === 'paid'}
                                                            onChange={(e) => onUpdateAppointmentField(p.id, 'payment_status', e.target.checked ? 'paid' : 'pending')}
                                                            className="hidden"
                                                        />
                                                        <span className={`text-sm font-bold ${p.payment_status === 'paid' ? 'text-green-700' : 'text-slate-500'}`}>
                                                            {p.payment_status === 'paid' ? 'PAGADO' : 'Pendiente de Pago'}
                                                        </span>
                                                    </label>
                                                </div>
                                            )}

                                            <input
                                                type="text"
                                                placeholder="Exámenes complementarios..."
                                                value={p.complementary_exams || ''}
                                                onChange={(e) => onUpdateAppointmentField(p.id, 'complementary_exams', e.target.value)}
                                                className="w-full text-sm border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-slate-50/50"
                                            />

                                            <textarea
                                                defaultValue={p.notes || ''}
                                                onBlur={(e) => onUpdateAppointmentField(p.id, 'notes', e.target.value)}
                                                className="w-full h-16 text-sm border-slate-200 rounded-lg p-2.5 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 bg-yellow-50/50 resize-none placeholder:text-slate-400"
                                                placeholder="Notas de enfermería / triaje..."
                                            ></textarea>
                                        </div>
                                    </div>

                                    {/* Right Column: Status & Actions */}
                                    <div className="p-5 md:w-64 bg-slate-50/50 border-t md:border-t-0 md:border-l border-slate-100 rounded-b-2xl md:rounded-r-2xl md:rounded-bl-none flex flex-col justify-between gap-4">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2">Estado del Paciente</p>
                                            <div className="grid grid-cols-2 gap-1.5">
                                                {/* Confirmó */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'confirmed')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'confirmed'
                                                            ? 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'confirmed' ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                    Confirmó
                                                </button>
                                                {/* No Responde */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'no_response')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'no_response'
                                                            ? 'bg-orange-100 text-orange-700 border-orange-200 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'no_response' ? 'bg-orange-500' : 'bg-slate-300'}`}></div>
                                                    No Responde
                                                </button>
                                                {/* En Camino */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'on_way')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'on_way'
                                                            ? 'bg-purple-100 text-purple-700 border-purple-200 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'on_way' ? 'bg-purple-500' : 'bg-slate-300'}`}></div>
                                                    En Camino
                                                </button>
                                                {/* Canceló */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'cancelled')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'cancelled'
                                                            ? 'bg-red-100 text-red-700 border-red-200 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'cancelled' ? 'bg-red-500' : 'bg-slate-300'}`}></div>
                                                    Canceló
                                                </button>
                                                {/* Llegó Puntual */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'arrived_ontime')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'arrived_ontime'
                                                            ? 'bg-green-100 text-green-700 border-green-200 shadow-sm ring-1 ring-green-200'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'arrived_ontime' ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                                                    Llegó ⭐
                                                </button>
                                                {/* Llegó Tarde */}
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'arrived_late')}
                                                    className={`px-2 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1
                                                    ${p.triage_status === 'arrived_late'
                                                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200 shadow-sm'
                                                            : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                                >
                                                    <div className={`w-1.5 h-1.5 rounded-full ${p.triage_status === 'arrived_late' ? 'bg-yellow-500' : 'bg-slate-300'}`}></div>
                                                    Llegó Tarde
                                                </button>
                                            </div>
                                            {/* Atendido - Full width */}
                                            <button
                                                onClick={() => onUpdateTriageStatus(p.id, 'attended')}
                                                className={`w-full px-3 py-2 rounded-lg text-xs font-bold border transition-all flex items-center justify-center gap-2 mt-2
                                                ${p.triage_status === 'attended'
                                                        ? 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                                            >
                                                <div className={`w-2 h-2 rounded-full ${p.triage_status === 'attended' ? 'bg-emerald-500' : 'bg-slate-300'}`}></div>
                                                Atendido
                                            </button>

                                            {/* Undo button for attended/cancelled */}
                                            {(p.triage_status === 'attended' || p.triage_status === 'cancelled') && (
                                                <button
                                                    onClick={() => onUpdateTriageStatus(p.id, 'confirmed')}
                                                    className="w-full px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition-all flex items-center justify-center gap-1 mt-1"
                                                >
                                                    ↩ Deshacer
                                                </button>
                                            )}
                                        </div>

                                        {/* Atender button - show for doctor/admin when not attended/cancelled/in_attention */}
                                        {p.triage_status !== 'attended' && p.triage_status !== 'cancelled' && p.triage_status !== 'in_attention' && (user.role === 'doctor' || user.role === 'admin') && (
                                            <button
                                                onClick={() => { onConvertToPatient(p); }}
                                                className="w-full bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all flex items-center justify-center group/btn mt-auto"
                                            >
                                                Atender <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        )}

                                        {/* In attention indicator */}
                                        {p.triage_status === 'in_attention' && (
                                            <div className="w-full bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mt-auto animate-pulse">
                                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-ping"></div>
                                                En Atención...
                                            </div>
                                        )}

                                        {/* Duration display for attended */}
                                        {p.triage_status === 'attended' && duration !== null && (
                                            <div className="w-full text-center text-emerald-600 text-xs font-bold mt-2">
                                                ⏱️ Duración: {duration} min
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div >
        </div >
    );
};

export default TriageView;
