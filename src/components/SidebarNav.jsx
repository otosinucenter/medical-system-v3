import React from 'react';
import { Activity, X, Users, Clipboard, UserPlus, CalendarDays, Trash2, Briefcase, Settings, LogOut } from 'lucide-react';

const SidebarNav = ({
    user,
    view,
    isMobileMenuOpen,
    onCloseMobile,
    onNavigate,
    onNewPatient,
    onOpenTeamModal,
    onOpenDataModal,
    onLogout
}) => {
    return (
        <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out shadow-2xl
      ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      md:translate-x-0 md:sticky md:top-0 md:h-screen md:shadow-none
    `}>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <h1 className="text-xl font-bold tracking-tight">DrListo</h1>
                    </div>
                    <div className="mt-2">
                        <p className="text-sm text-blue-100 font-medium">
                            ¡Hola, {user.user?.user_metadata?.full_name?.split(' ')[0] || 'Doctor'}!
                        </p>
                        <p className="text-xs text-slate-400 break-words">{user.user?.email}</p>
                    </div>
                </div>
                {/* Botón cerrar en móvil */}
                <button onClick={onCloseMobile} className="md:hidden text-slate-400 hover:text-white">
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
                <button
                    onClick={() => { onNavigate('list'); onCloseMobile(); }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                    <Users className="w-5 h-5 mr-3" />
                    <span className="font-medium">Pacientes</span>
                </button>

                <button
                    onClick={() => { onNavigate('triage'); onCloseMobile(); }}
                    className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'triage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                >
                    <Clipboard className="w-5 h-5 mr-3" />
                    <span className="font-medium">Triaje / Lista</span>
                </button>

                {(user.role === 'doctor' || user.role === 'admin') && (
                    <button
                        onClick={() => { onNewPatient(); onCloseMobile(); }}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 border border-blue-900/50'}`}
                    >
                        <UserPlus className="w-5 h-5 mr-3" />
                        <span className="font-medium">Nuevo Paciente</span>
                    </button>
                )}

                <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                    <button
                        onClick={() => { onNavigate('agenda-v2'); onCloseMobile(); }}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'agenda-v2' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <div className="relative mr-3">
                            <CalendarDays className="w-5 h-5" />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                        </div>
                        <span className="font-medium">Agenda v2.0</span>
                    </button>

                    <button
                        onClick={() => { onNavigate('trash'); onCloseMobile(); }}
                        className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'trash' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
                    >
                        <Trash2 className="w-5 h-5 mr-3" />
                        <span className="font-medium">Papelera</span>
                    </button>

                    {(user.role === 'admin') && (
                        <button
                            onClick={onOpenTeamModal}
                            className="w-full flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all"
                        >
                            <UserPlus className="w-5 h-5 mr-3" />
                            <span className="font-medium text-sm">Gestionar Equipo</span>
                        </button>
                    )}

                    <button
                        onClick={onOpenDataModal}
                        className="w-full flex items-center p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all"
                    >
                        <Briefcase className="w-5 h-5 mr-3" />
                        <span className="font-medium text-sm">Gestión de Datos</span>
                    </button>

                    {(user.role === 'admin' || user.role === 'doctor') && (
                        <button
                            onClick={() => { onNavigate('config'); onCloseMobile(); }}
                            className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'config' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
                        >
                            <Settings className="w-5 h-5 mr-3" />
                            <span className="font-medium text-sm">Configuración</span>
                        </button>
                    )}
                </div>
            </nav>

            <div className="absolute bottom-0 left-0 w-full p-4 bg-slate-900 border-t border-slate-800">
                <button
                    onClick={onLogout}
                    className="flex items-center text-slate-400 hover:text-red-400 transition-colors text-sm font-medium w-full mb-3"
                >
                    <LogOut className="w-5 h-5 mr-3" />
                    Cerrar Sesión
                </button>
                <div className="text-center">
                    <span className="text-[10px] text-slate-600 font-medium">V 2.0 (stable)</span>
                </div>
            </div>
        </aside>
    );
};

export default SidebarNav;
