import React, { useState, useEffect, useMemo } from 'react';
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

    // Auto-ajuste inteligente según cantidad de medicamentos
    const scaling = useMemo(() => {
        const count = editableReceta.length;

        if (count <= 4) {
            return {
                fontSize: '0.9rem',
                headerSize: 'text-2xl',
                headerPadding: 'pb-2 mb-2',
                patientPadding: 'py-1.5',
                rowPadding: 'py-1.5',
                footerSize: 'h-16',
                indicacionesRows: 3,
                compact: false
            };
        } else if (count <= 6) {
            return {
                fontSize: '0.8rem',
                headerSize: 'text-xl',
                headerPadding: 'pb-1.5 mb-1.5',
                patientPadding: 'py-1',
                rowPadding: 'py-1',
                footerSize: 'h-14',
                indicacionesRows: 2,
                compact: false
            };
        } else if (count <= 8) {
            return {
                fontSize: '0.7rem',
                headerSize: 'text-lg',
                headerPadding: 'pb-1 mb-1',
                patientPadding: 'py-0.5',
                rowPadding: 'py-0.5',
                footerSize: 'h-12',
                indicacionesRows: 2,
                compact: true
            };
        } else {
            return {
                fontSize: '0.6rem',
                headerSize: 'text-base',
                headerPadding: 'pb-0.5 mb-0.5',
                patientPadding: 'py-0.5',
                rowPadding: 'py-0',
                footerSize: 'h-10',
                indicacionesRows: 1,
                compact: true
            };
        }
    }, [editableReceta.length]);

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

                {/* Contenido A5 - AUTO-AJUSTABLE */}
                <div
                    id="printable-area"
                    className="bg-white text-black relative mx-auto flex flex-col overflow-hidden"
                    style={{
                        width: '210mm',
                        height: '148mm',
                        padding: scaling.compact ? '4mm 8mm' : '6mm 10mm',
                        fontSize: scaling.fontSize
                    }}
                >

                    {/* Encabezado - Auto-ajustable */}
                    <div className={`${scaling.headerPadding} flex justify-between items-start`} style={{ borderBottom: '2px solid #1e40af' }}>
                        <div>
                            <h1 className={`${scaling.headerSize} font-black text-blue-900 uppercase tracking-tight leading-none`} style={{ fontFamily: 'system-ui' }}>
                                {doctorInfo.nombre}
                            </h1>
                            <p className={`${scaling.compact ? 'text-xs' : 'text-sm'} font-bold text-blue-700 uppercase mt-0.5 tracking-wider`}>
                                {doctorInfo.especialidad}
                            </p>
                            {!scaling.compact && (
                                <p className="text-xs text-gray-500 tracking-widest">
                                    {doctorInfo.credenciales}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            {!scaling.compact && <p className="text-xs text-blue-600 font-semibold">{doctorInfo.contacto}</p>}
                            <div className={`font-bold ${scaling.compact ? 'text-sm' : 'text-lg'} text-gray-800`}>
                                {new Date(consultation.fechaCita).toLocaleDateString('es-PE')}
                            </div>
                        </div>
                    </div>

                    {/* Datos Paciente - Compacto cuando necesario */}
                    <div className={`mb-1 rounded overflow-hidden`} style={{ border: '1px solid #dbeafe', background: 'linear-gradient(to right, #eff6ff, #f8fafc)' }}>
                        <div className={`flex justify-between items-center px-2 ${scaling.patientPadding}`}>
                            <div className="flex-1 flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">PACIENTE:</span>
                                <span className="font-semibold text-gray-800">{patient.nombre}</span>
                            </div>
                            <div className="flex items-baseline gap-1 px-3">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">EDAD:</span>
                                <span className="font-semibold text-gray-800">{patient.edad}</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">DNI:</span>
                                <span className="font-semibold text-gray-800">{patient.id}</span>
                            </div>
                        </div>
                        <div className={`px-2 ${scaling.patientPadding} bg-blue-50/50 border-t border-blue-100`}>
                            <div className="flex items-baseline gap-1">
                                <span className="font-bold text-blue-800 uppercase text-[10px]">DX:</span>
                                <span className="italic text-gray-700 text-xs truncate">{consultation.diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabla Receta - Flex grow para usar espacio disponible */}
                    <div className="flex-1 overflow-hidden">
                        <table className="w-full border-collapse table-fixed">
                            <thead>
                                <tr style={{ borderBottom: '2px solid #1e40af', background: '#f8fafc' }}>
                                    <th className={`text-left ${scaling.rowPadding} px-1 font-bold text-blue-900 w-[26%] uppercase text-[10px]`}>Medicamento</th>
                                    <th className={`text-center ${scaling.rowPadding} font-bold text-blue-900 w-[7%] uppercase text-[10px]`}>Cant.</th>
                                    <th className={`text-left ${scaling.rowPadding} px-1 font-bold text-blue-900 w-[47%] uppercase text-[10px]`}>Indicaciones</th>
                                    <th className={`text-center ${scaling.rowPadding} font-bold text-blue-900 w-[8%] uppercase text-[10px]`}>Vía</th>
                                    <th className={`text-center ${scaling.rowPadding} font-bold text-blue-900 w-[12%] uppercase text-[10px]`}>Días</th>
                                </tr>
                            </thead>
                            <tbody className="align-top">
                                {editableReceta.map((item, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                                        <td className={`${scaling.rowPadding} px-1`}>
                                            <textarea
                                                className="w-full bg-transparent font-semibold text-gray-900 outline-none resize-none overflow-hidden leading-tight"
                                                rows={1}
                                                value={item.med}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].med = e.target.value; setEditableReceta(n); }}
                                                style={{ minHeight: 'auto' }}
                                            />
                                        </td>
                                        <td className={`${scaling.rowPadding} text-center`}>
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.cant}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].cant = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${scaling.rowPadding} px-1`}>
                                            <textarea
                                                className="w-full bg-transparent outline-none resize-none overflow-hidden leading-tight text-gray-700"
                                                rows={1}
                                                value={item.ind}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].ind = e.target.value; setEditableReceta(n); }}
                                                style={{ minHeight: 'auto' }}
                                            />
                                        </td>
                                        <td className={`${scaling.rowPadding} text-center`}>
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.via}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].via = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                        <td className={`${scaling.rowPadding} text-center`}>
                                            <input
                                                className="w-full bg-transparent text-center outline-none text-gray-700"
                                                value={item.dur}
                                                onChange={(e) => { const n = [...editableReceta]; n[idx].dur = e.target.value; setEditableReceta(n); }}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer - Compacto cuando necesario */}
                    <div className="mt-auto pt-1 flex gap-3" style={{ borderTop: '1px dashed #94a3b8' }}>
                        <div className="flex-1">
                            <h3 className="font-bold text-[10px] uppercase text-blue-900 tracking-wide">INDICACIONES ADICIONALES:</h3>
                            <textarea
                                className="w-full text-xs resize-none outline-none bg-transparent text-gray-700 leading-tight"
                                rows={scaling.indicacionesRows}
                                value={editableIndicaciones}
                                onChange={(e) => setEditableIndicaciones(e.target.value)}
                                placeholder="• Evitar..."
                            />
                        </div>
                        <div className={`w-32 ${scaling.footerSize} border border-gray-300 rounded flex flex-col items-center justify-end pb-1 bg-gray-50/50`}>
                            <div className="w-20 border-t border-gray-300 mb-0.5"></div>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-wide">Sello y Firma</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrescriptionModal;
