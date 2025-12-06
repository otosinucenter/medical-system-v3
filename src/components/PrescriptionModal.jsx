import React, { useState, useEffect } from 'react';
import { Edit3, Save, Printer, X } from 'lucide-react';

const PrescriptionModal = ({
    isOpen,
    onClose,
    patient,
    consultation,
    doctorInfo,
    onSave,
    onSaveAndFinish,
    onPrint
}) => {
    const [editableReceta, setEditableReceta] = useState([]);
    const [editableIndicaciones, setEditableIndicaciones] = useState("");

    useEffect(() => {
        if (isOpen && consultation) {
            setEditableReceta(JSON.parse(JSON.stringify(consultation.receta || [])));
            setEditableIndicaciones(consultation.indicaciones || "");
        }
    }, [isOpen, consultation]);

    const handleSave = () => {
        onSave(editableReceta, editableIndicaciones);
    };

    const handlePrint = () => {
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center overflow-y-auto p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative overflow-hidden">

                {/* Header Modal - Mejorado */}
                <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-800 no-print">
                    <h3 className="font-bold text-white flex items-center text-lg">
                        <Edit3 className="w-5 h-5 mr-2" /> Vista Previa Receta (A5 Horizontal)
                    </h3>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-600 shadow-md transition-colors">
                            Guardar Cambios
                        </button>
                        <button onClick={onSaveAndFinish} className="bg-white text-blue-800 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-50 flex items-center shadow-md transition-colors">
                            <Save className="w-4 h-4 mr-1" /> Guardar y Finalizar
                        </button>
                        <button onClick={handlePrint} className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 flex items-center shadow-md transition-colors">
                            <Printer className="w-4 h-4 mr-1" /> Imprimir
                        </button>
                        <button onClick={onClose} className="text-white hover:text-gray-200 ml-2 transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Contenido A5 - REDISEÑADO */}
                <div id="printable-area" className="bg-white text-black relative mx-auto flex flex-col overflow-hidden" style={{ width: '210mm', height: '148mm', padding: '6mm 10mm' }}>

                    {/* Encabezado Premium */}
                    <div className="pb-2 mb-2 flex justify-between items-start" style={{ borderBottom: '3px solid #1e40af' }}>
                        <div>
                            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight leading-none" style={{ fontFamily: 'system-ui' }}>
                                {doctorInfo.nombre}
                            </h1>
                            <p className="text-sm font-bold text-blue-700 uppercase mt-1 tracking-wider">
                                {doctorInfo.especialidad}
                            </p>
                            <p className="text-xs text-gray-500 tracking-widest mt-0.5">
                                {doctorInfo.credenciales}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-600 font-semibold">{doctorInfo.contacto}</p>
                            <div className="font-bold text-lg text-gray-800 mt-1">
                                {new Date(consultation.fechaCita).toLocaleDateString('es-PE')}
                            </div>
                        </div>
                    </div>

                    {/* Datos Paciente - Mejorado */}
                    <div className="mb-2 rounded-lg overflow-hidden" style={{ border: '1px solid #dbeafe', background: 'linear-gradient(to right, #eff6ff, #f8fafc)' }}>
                        <div className="flex justify-between items-center px-3 py-1.5">
                            <div className="flex-1 flex items-baseline gap-2">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">PACIENTE:</span>
                                <span className="font-semibold text-gray-800">{patient.nombre}</span>
                            </div>
                            <div className="flex items-baseline gap-2 px-4">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">EDAD:</span>
                                <span className="font-semibold text-gray-800">{patient.edad} {(!patient.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</span>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">DNI:</span>
                                <span className="font-semibold text-gray-800">{patient.id}</span>
                            </div>
                        </div>
                        <div className="px-3 py-1 bg-blue-50/50 border-t border-blue-100">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">DX:</span>
                                <span className="italic text-gray-700 text-sm">{consultation.diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Receta - Rediseñada */}
                    <div className="mb-2 flex-1 relative">
                        <div style={{ fontSize: editableReceta.length > 8 ? '0.7rem' : (editableReceta.length > 6 ? '0.8rem' : '0.9rem') }}>
                            <table className="w-full border-collapse table-fixed">
                                <thead>
                                    <tr style={{ borderBottom: '2px solid #1e40af', background: '#f8fafc' }}>
                                        <th className="text-left py-1.5 px-2 font-bold text-blue-900 w-[28%] uppercase text-xs tracking-wide">Medicamento</th>
                                        <th className="text-center py-1.5 font-bold text-blue-900 w-[8%] uppercase text-xs tracking-wide">Cant.</th>
                                        <th className="text-left py-1.5 px-2 font-bold text-blue-900 w-[44%] uppercase text-xs tracking-wide">Indicaciones</th>
                                        <th className="text-center py-1.5 font-bold text-blue-900 w-[8%] uppercase text-xs tracking-wide">Vía</th>
                                        <th className="text-center py-1.5 font-bold text-blue-900 w-[12%] uppercase text-xs tracking-wide">Días</th>
                                    </tr>
                                </thead>
                                <tbody className="align-top">
                                    {editableReceta.map((item, idx) => (
                                        <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }} className="hover:bg-blue-50/30">
                                            <td className="py-1 px-2">
                                                <textarea
                                                    className="w-full bg-transparent font-semibold text-gray-900 outline-none placeholder-gray-300 resize-none overflow-hidden leading-snug"
                                                    rows={Math.max(2, Math.ceil(item.med.length / 25))}
                                                    value={item.med}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].med = e.target.value; setEditableReceta(n); }}
                                                    placeholder="Medicamento"
                                                />
                                            </td>
                                            <td className="py-1 text-center">
                                                <input
                                                    className="w-full bg-transparent text-center outline-none text-gray-700 font-medium"
                                                    value={item.cant}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].cant = e.target.value; setEditableReceta(n); }}
                                                />
                                            </td>
                                            <td className="py-1 px-2">
                                                <textarea
                                                    className="w-full bg-transparent outline-none resize-none overflow-hidden whitespace-pre-wrap leading-snug text-gray-700"
                                                    rows={Math.max(2, Math.ceil(item.ind.length / 40))}
                                                    value={item.ind}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].ind = e.target.value; setEditableReceta(n); }}
                                                />
                                            </td>
                                            <td className="py-1 text-center">
                                                <input
                                                    className="w-full bg-transparent text-center outline-none text-gray-700 font-medium"
                                                    value={item.via}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].via = e.target.value; setEditableReceta(n); }}
                                                />
                                            </td>
                                            <td className="py-1 text-center">
                                                <input
                                                    className="w-full bg-transparent text-center outline-none text-gray-700 font-medium"
                                                    value={item.dur}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].dur = e.target.value; setEditableReceta(n); }}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Footer - Indicaciones y Firma */}
                    <div className="mt-auto pt-2 flex gap-4" style={{ borderTop: '2px dashed #cbd5e1' }}>
                        <div className="flex-1">
                            <h3 className="font-bold text-xs uppercase mb-1 text-blue-900 tracking-wide">
                                INDICACIONES ADICIONALES:
                            </h3>
                            <textarea
                                className="w-full text-sm resize-none outline-none bg-transparent whitespace-pre-wrap text-gray-700 leading-relaxed"
                                rows={3}
                                value={editableIndicaciones}
                                onChange={(e) => setEditableIndicaciones(e.target.value)}
                                placeholder="• Evitar..."
                            />
                        </div>
                        <div className="w-44 h-20 border-2 border-gray-200 rounded-lg flex flex-col items-center justify-end pb-2 bg-gray-50/50">
                            <div className="w-28 border-t border-gray-300 mb-1"></div>
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sello y Firma</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
