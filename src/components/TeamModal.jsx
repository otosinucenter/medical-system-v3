import React from 'react';
import { UserPlus, X } from 'lucide-react';

const TeamModal = ({
    isOpen,
    onClose,
    newMember,
    onNewMemberChange,
    onSubmit,
    isLoading
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
            <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center">
                        <UserPlus className="w-5 h-5 mr-2" /> Agregar Miembro al Equipo
                    </h3>
                    <button onClick={onClose} className="hover:text-gray-300">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={onSubmit} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 mb-4">
                        Crearás una cuenta vinculada a tu consultorio. Tú defines la contraseña inicial.
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                        <input
                            required
                            type="text"
                            value={newMember.name}
                            onChange={e => onNewMemberChange({ ...newMember, name: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="Dr. Ejemplo"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                        <input
                            required
                            type="email"
                            value={newMember.email}
                            onChange={e => onNewMemberChange({ ...newMember, email: e.target.value })}
                            className="w-full border p-2 rounded"
                            placeholder="usuario@medsys.local"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Inicial</label>
                        <input
                            required
                            type="text"
                            value={newMember.password}
                            onChange={e => onNewMemberChange({ ...newMember, password: e.target.value })}
                            className="w-full border p-2 rounded bg-yellow-50"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Rol</label>
                        <select
                            value={newMember.role}
                            onChange={e => onNewMemberChange({ ...newMember, role: e.target.value })}
                            className="w-full border p-2 rounded"
                        >
                            <option value="doctor">Médico</option>
                            <option value="assistant">Asistente / Recepción</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-2 border rounded text-gray-600 font-bold">
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow disabled:opacity-50"
                        >
                            {isLoading ? 'Creando...' : 'Crear Cuenta'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TeamModal;
