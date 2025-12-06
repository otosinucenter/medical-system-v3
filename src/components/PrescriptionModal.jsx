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

    // Calcular tamaño de fuente basado en cantidad de medicamentos
    const count = editableReceta.length;
    const tableFontSize = count > 8 ? '11px' : count > 6 ? '12px' : '13px';
    const tableRowHeight = count > 8 ? '22px' : count > 6 ? '26px' : '30px';

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

                {/* Contenido A5 - Siempre completo */}
                <div
                    id="printable-area"
                    className="bg-white text-black relative mx-auto flex flex-col"
                    style={{
                        width: '210mm',
                        height: '148mm',
                        padding: '5mm 8mm',
                    }}
                >

                    {/* Encabezado - SIEMPRE COMPLETO */}
                    <div className="pb-1 mb-1 flex justify-between items-start" style={{ borderBottom: '3px solid #1e40af' }}>
                        <div>
                            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight leading-none" style={{ fontFamily: 'system-ui' }}>
                                {doctorInfo.nombre}
                            </h1>
                            <p className="text-sm font-bold text-blue-700 uppercase mt-0.5 tracking-wider">
                                {doctorInfo.especialidad}
                            </p>
                            <p className="text-xs text-gray-500 tracking-widest">
                                {doctorInfo.credenciales}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-blue-600 font-semibold">{doctorInfo.contacto}</p>
                            <div className="font-bold text-xl text-gray-800 mt-0.5">
                                {new Date(consultation.fechaCita).toLocaleDateString('es-PE')}
                            </div>
                        </div>
                    </div>

                    {/* Datos Paciente - SIEMPRE COMPLETO */}
                    <div className="mb-1 rounded-lg overflow-hidden" style={{ border: '1px solid #dbeafe', background: 'linear-gradient(to right, #eff6ff, #f8fafc)' }}>
                        <div className="flex justify-between items-center px-3 py-1">
                            <div className="flex-1 flex items-baseline gap-2">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">PACIENTE:</span>
                                <span className="font-semibold text-gray-800 text-sm">{patient.nombre}</span>
                            </div>
                            <div className="flex items-baseline gap-1 px-4">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">EDAD:</span>
                                <span className="font-semibold text-gray-800 text-sm">{patient.edad}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">DNI:</span>
                                <span className="font-semibold text-gray-800 text-sm">{patient.id}</span>
                            </div>
                        </div>
                        <div className="px-3 py-0.5 bg-blue-50/50 border-t border-blue-100">
                            <div className="flex items-baseline gap-2">
                                <span className="font-bold text-blue-800 uppercase text-xs tracking-wide">DX:</span>
                                <span className="italic text-gray-700 text-xs">{consultation.diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Receta - FLEX GROW para aprovechar espacio */}
                    <div className="flex-1 overflow-hidden mb-1">
                        <table className="w-full border-collapse table-fixed h-full" style={{ fontSize: tableFontSize }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #1e40af', background: '#f8fafc' }}>
                                    <th className="text-left py-1 px-2 font-bold text-blue-900 w-[27%] uppercase text-xs">Medicamento</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[7%] uppercase text-xs">Cant.</th>
                                    <th className="text-left py-1 px-2 font-bold text-blue-900 w-[46%] uppercase text-xs">Indicaciones</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[8%] uppercase text-xs">Vía</th>
                                    <th className="text-center py-1 font-bold text-blue-900 w-[12%] uppercase text-xs">Días</th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {editableReceta.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0', height: tableRowHeight }}>
                                        <td className="py-0.5 px-2">
                                            <textarea
                                                className="w-full bg-transparent font-semibold text-gray-900 outline-none resize-none overflow-hidden leading-snug"
                                                rows={1}
                                                value={item.med}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].med = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className="py-0.5 text-center align-middle">
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.cant}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].cant = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className="py-0.5 px-2">
                                            <textarea
                                                className="w-full bg-transparent outline-none resize-none overflow-hidden leading-snug text-gray-700"
                                                rows={1}
                                                value={item.ind}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].ind = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className="py-0.5 text-center align-middle">
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.via}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].via = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className="py-0.5 text-center align-middle">
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

                    {/* Footer - Indicaciones, Control y Firma */}
                    <div className="mt-auto pt-1 border-t-2 border-dashed border-gray-300">
                        <div className="flex gap-4">
                            {/* Indicaciones Adicionales */}
                            <div className="flex-1">
                                <h3 className="font-bold text-xs uppercase text-blue-900 tracking-wide mb-0.5">INDICACIONES ADICIONALES:</h3>
                                <textarea
                                    className="w-full text-sm resize-none outline-none bg-transparent text-gray-700 leading-snug"
                                    rows={2}
                                    value={editableIndicaciones}
                                    onChange={(e) => setEditableIndicaciones(e.target.value)}
                                    placeholder="• Evitar..."
                                />
                            </div>

                            {/* Sello y Firma */}
                            <div className="w-40 h-16 border-2 border-gray-300 rounded-lg flex flex-col items-center justify-end pb-1 bg-gray-50/50">
                                <div className="w-24 border-t border-gray-400 mb-0.5"></div>
                                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wide">Sello y Firma</span>
                            </div>
                        </div>

                        {/* Control sugerido */}
                        <div className="mt-1 pt-1 border-t border-gray-200 flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">📅 Se sugiere control en</span>
                            <input
                                type="text"
                                value={controlDias}
                                onChange={(e) => setControlDias(e.target.value)}
                                className="w-12 text-center font-bold text-blue-700 border-b-2 border-blue-400 bg-blue-50 outline-none text-lg"
                            />
                            <span className="text-sm font-semibold text-gray-700">días</span>
                            <span className="text-xs text-gray-400 ml-2">(o según evolución)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
