import React from 'react';
import { User, CalendarDays, Phone, Mail, History, Plus, Clipboard, FileText, Edit3 } from 'lucide-react';

const PatientHistoryView = ({
    patient,
    selectedConsultationIndex,
    onSelectConsultation,
    onNewConsultation,
    onBack,
    onOpenPrescription,
    onEditConsultation
}) => {
    if (!patient) return null;

    const getDisplayConsultation = () => {
        if (!patient.consultas) return patient;
        return patient.consultas[selectedConsultationIndex] || patient;
    };

    const currentConsultation = getDisplayConsultation();

    return (
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
            {/* HEADER: DATOS CLÍNICOS CRÍTICOS */}
            <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 no-print">
                {/* CARD 1: FILIACIÓN */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="font-bold text-blue-800 flex items-center mb-3"><User className="w-4 h-4 mr-2" /> FILIACIÓN Y CONTACTO</h3>
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                        <div className="col-span-2 font-bold text-lg text-gray-800">{patient.nombre}</div>
                        <div className="flex items-center text-gray-600"><CalendarDays className="w-3 h-3 mr-2" /> {patient.edad} {(!patient.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</div>
                        <div className="flex items-center text-gray-600">
                            <Phone className="w-3 h-3 mr-2" />
                            <a href={`https://wa.me/51${patient.celular?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 hover:underline">
                                {patient.celular}
                            </a>
                        </div>
                        <div className="flex items-center text-gray-600"><Mail className="w-3 h-3 mr-2" /> {patient.email || '-'}</div>
                        <div className="col-span-2 text-xs text-gray-500 mt-2 pt-2 border-t">Ref: {patient.referencia}</div>
                    </div>
                </div>

                {/* CARD 2: ANTECEDENTES */}
                <div className="p-4 rounded-lg border shadow-sm bg-white border-gray-200">
                    <h3 className="font-bold flex items-center mb-3 text-gray-700"><History className="w-4 h-4 mr-2" /> ANTECEDENTES</h3>
                    <div className="space-y-2 text-sm">
                        {patient.alergias && <div className="flex text-red-700 font-bold"><span className="w-24">ALERGIAS:</span> <span>{patient.alergias}</span></div>}
                        <div className="flex"><span className="w-24 font-bold text-gray-500">Patologías:</span> {patient.enfermedades || 'Niega'}</div>
                        <div className="flex"><span className="w-24 font-bold text-gray-500">Cirugías:</span> {patient.cirugias || 'Ninguna'}</div>
                    </div>
                </div>
            </div>

            {/* ACTIONS BAR */}
            <div className="col-span-3 flex justify-end gap-2 mb-2 no-print">
                <button onClick={() => onNewConsultation(patient)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 flex items-center"><Plus className="w-4 h-4 mr-2" /> NUEVA CONSULTA</button>
                <button onClick={onBack} className="border px-4 py-2 rounded text-sm hover:bg-gray-50">VOLVER</button>
            </div>

            {/* COLUMNA IZQUIERDA: HISTORIAL */}
            <div className="md:col-span-1 bg-white rounded-lg shadow border overflow-y-auto no-print">
                <div className="p-3 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase sticky top-0">Historial</div>
                <div className="divide-y">
                    {(patient.consultas || [patient]).map((consulta, idx) => (
                        <div key={idx} onClick={() => onSelectConsultation(idx)} className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedConsultationIndex === idx ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                            <div className="font-bold text-sm text-gray-800 mb-1">{new Date(consulta.fechaCita).toLocaleDateString()}</div>
                            <div className="text-xs text-blue-700 font-medium mb-1">{consulta.diagnosticos && consulta.diagnosticos.length > 0 ? consulta.diagnosticos[0].desc : 'S/D'}</div>
                            {consulta.atendidoPor && (
                                <div className="text-[10px] text-gray-500 flex items-center">
                                    <User className="w-3 h-3 mr-1" /> {consulta.atendidoPor}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* COLUMNA DERECHA: CONSULTA CLÍNICA */}
            <div className="md:col-span-2 bg-white rounded-lg shadow border flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-print">
                    <div className="flex justify-between items-start border-b pb-4">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center">
                                <Clipboard className="w-5 h-5 mr-2 text-teal-600" />
                                Consulta del {new Date(currentConsultation.fechaCita).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1"><strong>Motivo:</strong> {currentConsultation.resumen}</p>
                        </div>
                        {/* BOTÓN ABRIR RECETA MODAL */}
                        <button onClick={onOpenPrescription} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow-lg transform hover:scale-105 transition-all">
                            <FileText className="w-4 h-4 mr-2" /> 📄 Abrir Receta (A5)
                        </button>
                        <button onClick={onEditConsultation} className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 flex items-center shadow-lg transform hover:scale-105 transition-all ml-2">
                            <Edit3 className="w-4 h-4 mr-2" /> Editar
                        </button>
                    </div>

                    {/* Examen Físico */}
                    <div className="grid grid-cols-1 gap-2">
                        <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1 mb-1">Examen Físico</h4>
                        <div className="bg-gray-50 p-3 rounded border grid grid-cols-3 gap-4">
                            <div><strong className="text-xs text-teal-700 block">OÍDO</strong><p className="text-xs">{currentConsultation.examenOido || '-'}</p></div>
                            <div><strong className="text-xs text-teal-700 block">NARIZ</strong><p className="text-xs">{currentConsultation.examenNariz || '-'}</p></div>
                            <div><strong className="text-xs text-teal-700 block">GARGANTA</strong><p className="text-xs">{currentConsultation.examenGarganta || '-'}</p></div>
                        </div>
                    </div>

                    {/* Diagnósticos */}
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1 mb-2">Diagnósticos</h4>
                        <div className="space-y-1">
                            {currentConsultation.diagnosticos?.map((d, i) => (
                                <div key={i} className="flex items-center text-sm">
                                    <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded mr-2">{d.code}</span>
                                    {d.desc}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientHistoryView;
