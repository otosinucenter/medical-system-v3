import React from 'react';

const AgendaImportModal = ({
    isOpen,
    onClose,
    pasteText,
    onPasteTextChange,
    onImport
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">Importar Citas a la Agenda</h3>
                <p className="text-sm text-gray-600 mb-4">
                    Copia y pega las filas desde Excel. El sistema detectará automáticamente las columnas buscando el <strong>DNI (8 dígitos)</strong>.
                </p>
                <div className="bg-blue-50 p-3 rounded border border-blue-100 text-xs text-blue-800 mb-4">
                    <strong>Formato esperado:</strong> Fecha | Hora (ej: 11.2, 1) | Síntomas | <strong>DNI</strong> | Nombre ...
                </div>
                <textarea
                    className="w-full h-64 border p-2 rounded text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    placeholder="Pega aquí las filas de Excel..."
                    value={pasteText}
                    onChange={(e) => onPasteTextChange(e.target.value)}
                ></textarea>
                <div className="flex justify-end gap-3 mt-4">
                    <button onClick={onClose} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">
                        Cancelar
                    </button>
                    <button onClick={onImport} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">
                        Procesar Importación
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AgendaImportModal;
