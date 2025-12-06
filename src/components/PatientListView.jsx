import React from 'react';
import { Search, Briefcase, FileText, Trash2 } from 'lucide-react';

const PatientListView = ({
    user,
    patients,
    searchTerm,
    onSearchChange,
    onOpenDataModal,
    onExportCSV,
    onViewHistory,
    onDeletePatient
}) => {
    const filteredPatients = patients.filter(p =>
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex gap-4 items-center justify-between flex-wrap">
                <div className="relative max-w-xl flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o DNI..."
                        className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 no-print">
                    <button
                        onClick={onOpenDataModal}
                        className="flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 shadow transition-all transform hover:scale-105"
                    >
                        <Briefcase className="w-4 h-4 mr-2" /> Gestionar Datos / Backup
                    </button>
                    <button
                        onClick={onExportCSV}
                        className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow transition-all transform hover:scale-105"
                    >
                        <FileText className="w-4 h-4 mr-2" /> Reporte Excel (CSV)
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                        <tr>
                            <th className="p-4">Paciente</th>
                            <th className="p-4">Última Cita</th>
                            <th className="p-4">Acción</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPatients.map((p, idx) => {
                            const lastDate = p.consultas && p.consultas.length > 0 ? p.consultas[0].fechaCita : p.fechaCita;
                            return (
                                <tr key={idx} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">
                                        {p.nombre} <br />
                                        <span className="text-xs text-gray-500">DNI: {p.id}</span>
                                    </td>
                                    <td className="p-4 text-sm">
                                        {new Date(lastDate).toLocaleDateString()}{' '}
                                        <span className="text-gray-400 text-xs">
                                            {new Date(lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {(user.role === 'doctor' || user.role === 'admin') && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => onViewHistory(p)}
                                                    className="text-teal-600 hover:underline text-sm font-bold"
                                                >
                                                    Ver Historia
                                                </button>
                                                <button
                                                    onClick={() => onDeletePatient(p)}
                                                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50"
                                                    title="Mover a Papelera"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PatientListView;
