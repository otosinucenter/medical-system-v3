import React, { useState } from 'react';
import { Briefcase, X, Save, Download, History, FileText, Clipboard } from 'lucide-react';
import TrashView from './TrashView';

const DataManagementModal = ({
    isOpen,
    onClose,
    user,
    // Backup functions
    onExportJSON,
    onSaveToFolder,
    onConnectFolder,
    directoryHandle,
    // Restore functions
    importMode,
    onSetImportMode,
    onRestoreBackup,
    // Import functions
    importPreview,
    onSetImportPreview,
    onPreviewExcel,
    onProcessImport,
    onOpenPasteModal
}) => {
    const [activeTab, setActiveTab] = useState('backup');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center">
                        <Briefcase className="w-5 h-5 mr-2" /> Gestión de Datos y Respaldos
                    </h3>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab('backup')}
                        className={`flex-1 py-3 font-bold text-sm ${activeTab === 'backup' ? 'border-b-4 border-blue-600 text-blue-800 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        COPIA DE SEGURIDAD
                    </button>
                    <button
                        onClick={() => setActiveTab('import')}
                        className={`flex-1 py-3 font-bold text-sm ${activeTab === 'import' ? 'border-b-4 border-green-600 text-green-800 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        IMPORTAR DATOS (EXCEL)
                    </button>
                    <button
                        onClick={() => setActiveTab('trash')}
                        className={`flex-1 py-3 font-bold text-sm ${activeTab === 'trash' ? 'border-b-4 border-red-600 text-red-800 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        PAPELERA
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {activeTab === 'backup' && (
                        <div className="space-y-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-blue-900 mb-2 flex items-center">
                                    <Save className="w-4 h-4 mr-2" /> Exportar / Guardar Backup
                                </h4>
                                <p className="text-sm text-gray-600 mb-4">
                                    Descarga una copia completa de tu base de datos en formato JSON. Guarda este archivo en un lugar seguro (USB, Drive).
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={onExportJSON} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 shadow flex items-center">
                                        <Download className="w-4 h-4 mr-2" /> Descargar Backup (.json)
                                    </button>
                                    {directoryHandle ? (
                                        <button onClick={onSaveToFolder} className="bg-teal-600 text-white px-4 py-2 rounded font-bold hover:bg-teal-700 shadow flex items-center">
                                            <Save className="w-4 h-4 mr-2" /> Guardar en Carpeta Conectada
                                        </button>
                                    ) : (
                                        <button onClick={onConnectFolder} className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 shadow flex items-center">
                                            <Briefcase className="w-4 h-4 mr-2" /> Conectar Carpeta Local
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <h4 className="font-bold text-orange-900 mb-2 flex items-center">
                                    <History className="w-4 h-4 mr-2" /> Restaurar Backup
                                </h4>
                                <p className="text-sm text-gray-600 mb-3">
                                    Recupera tus datos desde un archivo `.json` previamente guardado.
                                </p>

                                <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded border">
                                    <span className="text-sm font-bold text-gray-700">Modo de Restauración:</span>
                                    <label className="flex items-center text-sm cursor-pointer">
                                        <input type="radio" name="restoreMode" checked={importMode === 'merge'} onChange={() => onSetImportMode('merge')} className="mr-1" />
                                        <span className="font-bold text-blue-700">Fusión (Merge)</span>
                                        <span className="text-xs text-gray-500 ml-1">- Agrega nuevos, mantiene existentes.</span>
                                    </label>
                                    <label className="flex items-center text-sm cursor-pointer">
                                        <input type="radio" name="restoreMode" checked={importMode === 'replace'} onChange={() => onSetImportMode('replace')} className="mr-1" />
                                        <span className="font-bold text-red-600">Reemplazo Total</span>
                                        <span className="text-xs text-gray-500 ml-1">- BORRA TODO y restaura.</span>
                                    </label>
                                </div>

                                <label className="block w-full border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:bg-orange-100 transition-colors">
                                    <Download className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                                    <span className="font-bold text-orange-800 block">Click para seleccionar archivo backup (.json)</span>
                                    <input type="file" accept=".json" onChange={onRestoreBackup} className="hidden" />
                                </label>
                            </div>
                        </div>
                    )}

                    {activeTab === 'import' && (
                        <div className="space-y-4">
                            {!importPreview ? (
                                <>
                                    <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                        <h4 className="font-bold text-green-900 mb-2">Importar desde Excel</h4>
                                        <p className="text-sm text-gray-600 mb-4">
                                            Sube tu archivo Excel con la lista de pacientes. El sistema intentará detectar automáticamente las columnas.
                                        </p>
                                        <label className="block w-full border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:bg-green-100 transition-colors">
                                            <FileText className="w-8 h-8 mx-auto text-green-500 mb-2" />
                                            <span className="font-bold text-green-800 block">Click para subir Excel (.xlsx)</span>
                                            <input type="file" accept=".xlsx, .xls" onChange={onPreviewExcel} className="hidden" />
                                        </label>
                                    </div>
                                    <div className="text-center text-gray-400 text-xs font-bold uppercase my-2">- O -</div>
                                    <button onClick={onOpenPasteModal} className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 flex justify-center items-center">
                                        <Clipboard className="w-4 h-4 mr-2" /> Pegar datos desde Portapapeles (Ctrl+V)
                                    </button>
                                </>
                            ) : (
                                <div className="flex flex-col h-full">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="font-bold text-gray-800">Vista Previa ({importPreview.fileName})</h4>
                                        <button onClick={() => onSetImportPreview(null)} className="text-red-500 text-xs font-bold hover:underline">Cancelar / Volver</button>
                                    </div>

                                    <div className="bg-gray-100 p-2 rounded text-xs overflow-x-auto mb-4 border">
                                        <table className="w-full whitespace-nowrap">
                                            <thead>
                                                <tr className="bg-gray-200">
                                                    {importPreview.headers.map((h, i) => <th key={i} className="p-2 text-left border-r border-gray-300">{h}</th>)}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importPreview.previewRows.map((row, i) => (
                                                    <tr key={i} className="border-b border-gray-200 bg-white">
                                                        {row.map((cell, j) => <td key={j} className="p-2 border-r border-gray-100">{cell}</td>)}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <p className="text-center text-gray-400 italic mt-2">Mostrando 5 primeros registros...</p>
                                    </div>

                                    <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                                        <h5 className="font-bold text-yellow-800 mb-2 text-sm">Opciones de Importación</h5>
                                        <div className="flex items-center gap-6 mb-4">
                                            <label className="flex items-center text-sm cursor-pointer">
                                                <input type="radio" name="importMode" checked={importMode === 'merge'} onChange={() => onSetImportMode('merge')} className="mr-2" />
                                                <div>
                                                    <span className="font-bold text-gray-800 block">Fusionar (Recomendado)</span>
                                                    <span className="text-xs text-gray-500">Agrega pacientes nuevos. No borra los existentes.</span>
                                                </div>
                                            </label>
                                            <label className="flex items-center text-sm cursor-pointer">
                                                <input type="radio" name="importMode" checked={importMode === 'replace'} onChange={() => onSetImportMode('replace')} className="mr-2" />
                                                <div>
                                                    <span className="font-bold text-red-600 block">Reemplazar Todo</span>
                                                    <span className="text-xs text-gray-500">Borra la base de datos actual y carga el Excel.</span>
                                                </div>
                                            </label>
                                        </div>
                                        <button onClick={onProcessImport} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 shadow-lg">
                                            CONFIRMAR IMPORTACIÓN ({importPreview.fullData.length} Registros)
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'trash' && (
                        <TrashView user={user} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataManagementModal;
