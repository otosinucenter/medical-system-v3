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
    const [controlDias, setControlDias] = useState("7");

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

    // Calcular tamaño de fuente adaptativo - más compacto cuando hay muchos
    const count = editableReceta.length;
    const tableFontSize = count > 9 ? '9px' : count > 7 ? '10px' : count > 5 ? '11px' : '12px';
    const rowPadding = count > 6 ? 'py-0' : 'py-0.5';
    const lineHeight = count > 7 ? '1.1' : '1.3';

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center overflow-y-auto p-4">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl relative overflow-hidden">

                {/* Header Modal */}
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

                {/* Contenido A5 */}
                <div
                    id="printable-area"
                    className="bg-white text-black relative mx-auto flex flex-col"
                    style={{
                        width: '210mm',
                        height: '148mm',
                        padding: '4mm 8mm',
                    }}
                >

                    {/* Clínica (opcional) */}
                    {doctorInfo.clinica && (
                        <div className="text-center mb-0.5">
                            <span className="text-sm font-bold text-gray-600 uppercase tracking-widest">{doctorInfo.clinica}</span>
                        </div>
                    )}

                    {/* Encabezado Doctor */}
                    <div className="pb-1 mb-1 flex justify-between items-start" style={{ borderBottom: '3px solid #1e40af' }}>
                        <div>
                            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight leading-none" style={{ fontFamily: 'system-ui' }}>
                                {doctorInfo.nombre}
                            </h1>
                            <p className="text-xs font-bold text-blue-700 uppercase mt-0.5 tracking-wider">
                                {doctorInfo.especialidad}
                            </p>
                            <p className="text-[10px] text-gray-500 tracking-widest">
                                {doctorInfo.credenciales}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-blue-600 font-semibold">{doctorInfo.contacto}</p>
                            <div className="font-bold text-lg text-gray-800 mt-0.5">
                                {new Date(consultation.fechaCita).toLocaleDateString('es-PE')}
                            </div>
                        </div>
                    </div>

                    {/* Datos Paciente */}
                    <div className="mb-1 rounded overflow-hidden" style={{ border: '1px solid #dbeafe', background: 'linear-gradient(to right, #eff6ff, #f8fafc)' }}>
                        <div className="flex justify-between items-center px-2 py-0.5">
                            <div className="flex-1 flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">PACIENTE:</span>
                                <span className="font-semibold text-gray-800 text-xs">{patient.nombre}</span>
                            </div>
                            <div className="flex items-baseline gap-1 px-3">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">EDAD:</span>
                                <span className="font-semibold text-gray-800 text-xs">{patient.edad}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">DNI:</span>
                                <span className="font-semibold text-gray-800 text-xs">{patient.id}</span>
                            </div>
                        </div>
                        <div className="px-2 py-0.5 bg-blue-50/50 border-t border-blue-100">
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">DX:</span>
                                <span className="italic text-gray-700 text-[10px]">{consultation.diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Receta - TEXTO COMPLETO SIN CORTAR */}
                    <div className="flex-1 overflow-hidden mb-1">
                        <table className="w-full border-collapse table-fixed" style={{ fontSize: tableFontSize }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #1e40af', background: '#f8fafc' }}>
                                    <th className="text-left py-1 px-2 font-bold text-blue-900 w-[28%] uppercase text-[10px]">Medicamento</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[7%] uppercase text-[10px]">Cant.</th>
                                    <th className="text-left py-1 px-2 font-bold text-blue-900 w-[45%] uppercase text-[10px]">Indicaciones</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[8%] uppercase text-[10px]">Vía</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[12%] uppercase text-[10px]">Días</th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {editableReceta.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #cbd5e1' }}>
                                        <td className={`${rowPadding} px-2`}>
                                            <textarea
                                                className="w-full bg-transparent font-semibold text-gray-900 outline-none resize-none overflow-hidden leading-tight"
                                                style={{ minHeight: '1em', lineHeight }}
                                                rows={Math.max(1, Math.ceil(item.med.length / 25))}
                                                value={item.med}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].med = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${rowPadding} text-center align-top`}>
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.cant}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].cant = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${rowPadding} px-2`}>
                                            <textarea
                                                className="w-full bg-transparent outline-none resize-none overflow-hidden leading-tight text-gray-700"
                                                style={{ minHeight: '1em', lineHeight }}
                                                rows={Math.max(1, Math.ceil(item.ind.length / 50))}
                                                value={item.ind}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].ind = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${rowPadding} text-center align-top`}>
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.via}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].via = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${rowPadding} text-center align-top`}>
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

                    {/* Footer */}
                    <div className="mt-auto border-t-2 border-dashed border-gray-300 pt-2">
                        {/* Fila 1: Indicaciones + Firma */}
                        <div className="flex gap-4 items-start mb-2">
                            {/* Indicaciones - MÁS ESPACIO */}
                            <div className="flex-1">
                                <h3 className="font-bold text-[10px] uppercase text-blue-900 tracking-wide mb-1">INDICACIONES ADICIONALES:</h3>
                                <div className="min-h-[50px] border-b border-dotted border-gray-300 pb-1">
                                    <textarea
                                        className="w-full text-[10px] resize-none outline-none bg-transparent text-gray-600 leading-relaxed"
                                        rows={3}
                                        value={editableIndicaciones}
                                        onChange={(e) => setEditableIndicaciones(e.target.value)}
                                        placeholder="• Evitar..."
                                    />
                                </div>
                            </div>

                            {/* Firma Digital */}
                            <div className="w-40 flex flex-col items-center justify-center">
                                {doctorInfo.firma ? (
                                    <img
                                        src={doctorInfo.firma}
                                        alt="Firma del Doctor"
                                        className="h-16 object-contain"
                                    />
                                ) : (
                                    <div className="w-full h-14 border border-gray-300 rounded flex flex-col items-center justify-end pb-1 bg-gray-50/50">
                                        <div className="w-24 border-t border-gray-400 mb-0.5"></div>
                                        <span className="text-[8px] text-gray-500 font-bold uppercase">Sello y Firma</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fila 2: Control sugerido - TODO EN UNA LÍNEA */}
                        <div className="pt-1 border-t border-gray-200 flex items-center gap-2 whitespace-nowrap">
                            <span className="text-xs font-semibold text-gray-600">📅 Se sugiere control en</span>
                            <input
                                type="text"
                                value={controlDias}
                                onChange={(e) => setControlDias(e.target.value)}
                                className="w-10 text-center font-bold text-blue-700 border-b-2 border-blue-400 bg-blue-50 outline-none text-base"
                            />
                            <span className="text-xs font-semibold text-gray-600">días</span>
                            <span className="text-[10px] text-gray-400">(o según evolución)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
