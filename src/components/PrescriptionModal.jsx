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
        // We assume the parent handles the actual window.print() or we can do it here.
        // But usually window.print() prints the whole window.
        // The parent likely has logic to handle print styles.
        // If we passed onPrint, we call it.
        if (onPrint) {
            onPrint();
        } else {
            window.print();
        }
    };

    if (!isOpen || !patient) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center overflow-y-auto p-4">
            <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl relative">

                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-100 rounded-t-lg no-print">
                    <h3 className="font-bold text-gray-700 flex items-center"><Edit3 className="w-4 h-4 mr-2" /> Vista Previa Receta (A5 Horizontal)</h3>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">Guardar Cambios</button>
                        <button onClick={onSaveAndFinish} className="bg-blue-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-900 flex items-center border border-blue-600"><Save className="w-3 h-3 mr-1" /> Guardar y Finalizar</button>
                        <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 flex items-center"><Printer className="w-3 h-3 mr-1" /> Imprimir</button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Contenido A5 (EDITABLE) */}
                <div id="printable-area" className="bg-white text-black relative mx-auto flex flex-col overflow-hidden" style={{ width: '210mm', height: '148mm', padding: '5mm 8mm' }}>

                    {/* Encabezado */}
                    <div className="border-b-[2px] border-blue-900 pb-1 mb-1 flex justify-between items-end">
                        <div>
                            <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide leading-none">{doctorInfo.nombre}</h1>
                            <p className="text-xs font-bold text-gray-600 uppercase mt-1 leading-none tracking-wider">{doctorInfo.especialidad}</p>
                            <p className="text-[10px] text-gray-500 tracking-widest mt-0.5 leading-none">{doctorInfo.credenciales}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-blue-800 font-bold mb-0.5">{doctorInfo.contacto}</p>
                            <div className="font-bold text-xs text-gray-800 leading-none">{new Date(consultation.fechaCita).toLocaleDateString()}</div>
                        </div>
                    </div>

                    {/* Datos Paciente */}
                    <div className="mb-1 text-xs border-y border-blue-100 py-0.5 bg-blue-50/30">
                        <div className="flex justify-between items-center px-2">
                            <div className="flex-1 flex items-baseline gap-2">
                                <span className="font-bold text-blue-900 uppercase text-[10px]">PACIENTE:</span>
                                <span className="font-medium truncate text-xs">{patient.nombre}</span>
                            </div>
                            <div className="w-24 flex items-baseline gap-2 justify-end">
                                <span className="font-bold text-blue-900 uppercase text-[10px]">EDAD:</span>
                                <span className="font-medium">{patient.edad} {(!patient.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</span>
                            </div>
                            <div className="w-32 flex items-baseline gap-2 justify-end">
                                <span className="font-bold text-blue-900 uppercase text-[10px]">DNI:</span>
                                <span className="font-medium">{patient.id}</span>
                            </div>
                        </div>
                        <div className="px-2 pt-0.5 flex items-baseline gap-2">
                            <span className="font-bold text-blue-900 uppercase text-[10px]">DX:</span>
                            <span className="truncate italic text-gray-700">{consultation.diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
                        </div>
                    </div>

                    {/* Tabla Receta (Inputs editables) */}
                    <div className="mb-1 flex-1 relative">
                        {/* Cálculo dinámico de tamaño de letra según cantidad de items */}
                        <div style={{ fontSize: editableReceta.length > 8 ? '0.65rem' : (editableReceta.length > 6 ? '0.75rem' : '0.85rem') }}>
                            <table className="w-full border-collapse table-fixed">
                                <thead>
                                    <tr className="border-b-2 border-blue-900">
                                        <th className="text-left py-0.5 font-bold text-blue-900 w-[30%] uppercase text-[10px] tracking-wider">Medicamento</th>
                                        <th className="text-center py-0.5 font-bold text-blue-900 w-[8%] uppercase text-[10px] tracking-wider">Cant.</th>
                                        <th className="text-left py-0.5 font-bold text-blue-900 w-[44%] uppercase text-[10px] tracking-wider pl-2">Indicaciones</th>
                                        <th className="text-center py-0.5 font-bold text-blue-900 w-[8%] uppercase text-[10px] tracking-wider">Vía</th>
                                        <th className="text-center py-0.5 font-bold text-blue-900 w-[10%] uppercase text-[10px] tracking-wider">Días</th>
                                    </tr>
                                </thead>
                                <tbody className="align-top">
                                    {editableReceta.map((item, idx) => (
                                        <tr key={idx} className="border-b border-gray-100">
                                            <td className="py-0 pr-2">
                                                <textarea
                                                    className="w-full bg-transparent font-bold text-gray-900 outline-none placeholder-gray-300 resize-none overflow-hidden leading-tight py-0.5"
                                                    rows={Math.max(2, Math.ceil(item.med.length / 30))}
                                                    value={item.med}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].med = e.target.value; setEditableReceta(n); }}
                                                    placeholder="Medicamento"
                                                />
                                            </td>
                                            <td className="py-0 px-1">
                                                <input className="w-full bg-transparent text-center outline-none text-gray-600 leading-tight py-0.5" value={item.cant} onChange={(e) => { const n = [...editableReceta]; n[idx].cant = e.target.value; setEditableReceta(n); }} />
                                            </td>
                                            <td className="py-0 px-2">
                                                <textarea
                                                    className="w-full bg-transparent outline-none resize-none overflow-hidden whitespace-pre-wrap leading-tight py-0.5"
                                                    rows={Math.max(2, Math.ceil(item.ind.length / 45))}
                                                    value={item.ind}
                                                    onChange={(e) => { const n = [...editableReceta]; n[idx].ind = e.target.value; setEditableReceta(n); }}
                                                />
                                            </td>
                                            <td className="py-0 px-1">
                                                <input className="w-full bg-transparent text-center outline-none text-gray-600 leading-tight py-0.5" value={item.via} onChange={(e) => { const n = [...editableReceta]; n[idx].via = e.target.value; setEditableReceta(n); }} />
                                            </td>
                                            <td className="py-0 px-1">
                                                <input className="w-full bg-transparent text-center outline-none text-gray-600 leading-tight py-0.5" value={item.dur} onChange={(e) => { const n = [...editableReceta]; n[idx].dur = e.target.value; setEditableReceta(n); }} />
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Rellenar líneas vacías si hay pocas */}
                                    {Array.from({ length: Math.max(0, 6 - editableReceta.length) }).map((_, i) => (
                                        <tr key={`empty-${i}`} className="border-b border-gray-50 h-2.5">
                                            <td className="py-0"></td>
                                            <td className="py-0"></td>
                                            <td className="py-0"></td>
                                            <td className="py-0"></td>
                                            <td className="py-0"></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Indicaciones Footer y Sello */}
                    <div className="mt-auto pt-1 border-t-2 border-dashed border-gray-300 flex gap-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-xs uppercase mb-1 text-blue-900">INDICACIONES ADICIONALES:</h3>
                            <textarea
                                className="w-full text-[6px] resize-none outline-none bg-transparent whitespace-pre-wrap font-medium text-gray-700 leading-tight"
                                rows={4}
                                value={editableIndicaciones}
                                onChange={(e) => setEditableIndicaciones(e.target.value)}
                                placeholder="• Evitar..."
                            />
                        </div>
                        <div className="w-48 h-24 border border-gray-200 rounded flex flex-col items-center justify-end pb-2">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Sello y Firma</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
