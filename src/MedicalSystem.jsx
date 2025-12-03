import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  UserPlus, Users, Search, Save, FileText, Calendar, Phone, Activity,
  ChevronRight, User, Clipboard, ArrowDownCircle, Stethoscope, Plus,
  Trash2, ListPlus, Pill, Ear, Smile, Mic2, Printer, Baby, Info,
  HelpCircle, Download, AlertCircle, History, Clock, Eye, MapPin,
  Briefcase, Mail, AlertTriangle, CalendarDays, FileSignature, Edit3, X, LogOut, MessageCircle, Link,
  RefreshCw, ChevronUp, ChevronDown, ArrowRight, CheckCircle2
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';



export default function MedicalSystem({ user, onLogout }) {
  console.log("MedicalSystem user prop:", user);
  const [view, setView] = useState('triage'); // triage, patients, history, agenda, agenda-v2
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [importText, setImportText] = useState('');
  const [diagInput, setDiagInput] = useState({ code: '', desc: '' });
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [selectedConsultationIndex, setSelectedConsultationIndex] = useState(0);
  const [editingConsultationIndex, setEditingConsultationIndex] = useState(null); // Nuevo estado para edición

  // Estado para el Modal de Receta
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [editableReceta, setEditableReceta] = useState([]);
  const [editableIndicaciones, setEditableIndicaciones] = useState("");

  // Estado para Importación Masiva (Pegar)
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // --- GESTIÓN DE DATOS (NUEVO) ---
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [dataModalTab, setDataModalTab] = useState('backup'); // 'backup' | 'import'
  const [importPreview, setImportPreview] = useState(null); // { headers: [], rows: [] }
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [selectedAppointments, setSelectedAppointments] = useState([]); // For bulk delete in Agenda
  const [selectedTriageItems, setSelectedTriageItems] = useState([]); // For bulk delete in Triage

  // --- PERSISTENCIA EN CARPETA LOCAL (FILE SYSTEM ACCESS API) ---
  const [directoryHandle, setDirectoryHandle] = useState(null);

  const handleConnectFolder = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert("Tu navegador no soporta la funcionalidad de guardar en carpeta local. Por favor usa Chrome, Edge o un navegador basado en Chromium.");
      return;
    }
    try {
      const handle = await window.showDirectoryPicker();
      setDirectoryHandle(handle);
      alert("Carpeta conectada exitosamente. Ahora puedes guardar y cargar datos directamente.");
    } catch (err) {
      console.error(err);
      alert("No se pudo conectar a la carpeta (o el usuario canceló).");
    }
  };

  const saveToFolder = async () => {
    if (!directoryHandle) {
      alert("Primero debes conectar una carpeta.");
      return;
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle('patients.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(patients, null, 2));
      await writable.close();
      alert("Datos guardados exitosamente en 'patients.json'.");
    } catch (err) {
      console.error(err);
      alert("Error al guardar en la carpeta.");
    }
  };

  const loadFromFolder = async () => {
    if (!directoryHandle) {
      alert("Primero debes conectar una carpeta.");
      return;
    }
    try {
      const fileHandle = await directoryHandle.getFileHandle('patients.json');
      const file = await fileHandle.getFile();
      const text = await file.text();
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        if (window.confirm(`Se encontraron ${json.length} pacientes en la carpeta. ¿Deseas reemplazar la base de datos actual?`)) {
          setPatients(json);
          alert("Datos cargados exitosamente.");
        }
      } else {
        alert("El archivo patients.json no tiene el formato correcto.");
      }
    } catch (err) {
      console.error(err);
      alert("No se encontró 'patients.json' en la carpeta o hubo un error al leer.");
    }
  };

  // --- BASE DE DATOS (SUPABASE) ---
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: '', role: 'doctor' });
  const [isAgendaImportOpen, setIsAgendaImportOpen] = useState(false); // New state for Agenda Import
  const [agendaPasteText, setAgendaPasteText] = useState(""); // New state for paste text

  const handleCreateTeamMember = async (e) => {
    e.preventDefault();
    setTeamLoading(true);

    try {
      // 1. Crear cliente temporal para no perder la sesión actual
      const tempSupabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
      );

      // 2. Crear usuario
      const { data: authData, error: authError } = await tempSupabase.auth.signUp({
        email: newMember.email,
        password: newMember.password,
        options: {
          data: {
            role: newMember.role,
            username: newMember.name
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      // 3. Crear Perfil vinculado
      const { error: profileError } = await tempSupabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          clinic_id: user.clinicId,
          role: newMember.role,
          full_name: newMember.name
        }]);

      if (profileError) throw profileError;

      alert(`¡Genial! Hemos enviado un correo de invitación a ${newMember.email}.\n\nPor favor, avísale a ${newMember.name} que revise su bandeja de entrada (y Spam) para confirmar su cuenta y crear su contraseña.`);
      setIsTeamModalOpen(false);
      setNewMember({ name: '', email: '', password: '', role: 'doctor' });

    } catch (error) {
      console.error("Error creando miembro:", error);
      alert("Error: " + error.message);
    } finally {
      setTeamLoading(false);
    }
  };

  // --- NAVEGACIÓN Y PERSISTENCIA (URL) ---
  const navigate = (newView, params = {}) => {
    setView(newView);

    // Construir URL
    const url = new URL(window.location);
    url.searchParams.set('view', newView);

    // Limpiar params anteriores específicos si cambiamos de vista principal
    if (newView !== 'detail') url.searchParams.delete('patientId');

    // Agregar nuevos params
    Object.keys(params).forEach(key => {
      if (params[key]) url.searchParams.set(key, params[key]);
      else url.searchParams.delete(key);
    });

    window.history.pushState({ view: newView, ...params }, '', url);
  };

  // Sincronizar con URL al cargar y al usar botones Atrás/Adelante
  useEffect(() => {
    const handlePopState = async () => {
      const params = new URLSearchParams(window.location.search);
      const viewParam = params.get('view') || 'list';
      const patientId = params.get('patientId');

      setView(viewParam);

      if (viewParam === 'detail' && patientId) {
        // Intentar recuperar paciente si no está seleccionado
        if (!selectedPatient || selectedPatient.id !== patientId) {
          // Buscar en la lista local primero
          const found = patients.find(p => p.id === patientId);
          if (found) {
            setSelectedPatient(found);
          } else {
            // Si no está en local (ej. refresh), intentar fetch rápido o esperar a que carguen pacientes
            // Por ahora confiamos en que 'patients' ya se disparó en mount.
            // Si 'patients' está vacío, este efecto se ejecutará de nuevo cuando 'patients' cambie si lo agregamos a deps?
            // Mejor: un efecto separado que reaccione a 'patients' y URL.
          }
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Ejecutar al inicio
    handlePopState();

    return () => window.removeEventListener('popstate', handlePopState);
  }, [patients]); // Dependencia 'patients' para re-intentar buscar si cargan tarde

  // --- EFECTOS ---
  // --- UTILS ---
  const TrashView = ({ user }) => {
    const [activeTab, setActiveTab] = useState('appointments'); // 'appointments' | 'patients'
    const [trashedAppointments, setTrashedAppointments] = useState([]);
    const [trashedPatients, setTrashedPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState(new Set()); // For bulk actions

    const fetchTrash = async () => {
      setLoading(true);
      try {
        // Fetch Appointments
        const { data: apts } = await supabase
          .from('appointments')
          .select('*')
          .eq('clinic_id', user.clinicId)
          .eq('status', 'trash')
          .order('appointment_date', { ascending: false });

        if (apts) setTrashedAppointments(apts);

        // Fetch Patients
        const { data: pats } = await supabase
          .from('patients')
          .select('*')
          .eq('clinic_id', user.clinicId)
          .eq('status', 'trash')
          .order('updated_at', { ascending: false });

        if (pats) {
          const mappedPats = pats.map(row => ({ ...row.data, id: row.id, status: row.status }));
          setTrashedPatients(mappedPats);
        }

      } catch (error) {
        console.error("Error fetching trash:", error);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchTrash();
    }, []);

    // Reset selection when tab changes
    useEffect(() => {
      setSelectedIds(new Set());
    }, [activeTab]);

    const toggleSelectAll = () => {
      const currentItems = activeTab === 'appointments' ? trashedAppointments : trashedPatients;
      if (selectedIds.size === currentItems.length) {
        setSelectedIds(new Set()); // Deselect all
      } else {
        setSelectedIds(new Set(currentItems.map(i => i.id))); // Select all
      }
    };

    const toggleSelect = (id) => {
      const newSelected = new Set(selectedIds);
      if (newSelected.has(id)) newSelected.delete(id);
      else newSelected.add(id);
      setSelectedIds(newSelected);
    };

    const restoreSelected = async () => {
      if (selectedIds.size === 0) return;
      if (!confirm(`¿Restaurar ${selectedIds.size} elementos seleccionados?`)) return;

      const table = activeTab === 'appointments' ? 'appointments' : 'patients';
      const status = activeTab === 'appointments' ? 'pending' : 'active';

      try {
        const { error } = await supabase
          .from(table)
          .update({ status: status })
          .in('id', Array.from(selectedIds));

        if (error) throw error;

        alert("Elementos restaurados.");
        setSelectedIds(new Set());
        fetchTrash();
      } catch (error) {
        console.error("Error restoring:", error);
        alert("Error al restaurar.");
      }
    };

    const handleBulkDelete = async () => {
      if (selectedAppointments.length === 0) return;
      if (!window.confirm(`¿Estás seguro de eliminar ${selectedAppointments.length} citas seleccionadas? Esta acción moverá las citas a la papelera.`)) return;

      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'trash' })
          .in('id', selectedAppointments);

        if (error) throw error;

        alert("Citas eliminadas correctamente.");
        setSelectedAppointments([]);
        fetchAppointments();
      } catch (error) {
        console.error("Error deleting appointments:", error);
        alert("Error al eliminar citas.");
      }
    };



    const deleteSelectedPermanently = async () => {
      if (selectedIds.size === 0) return;
      if (!confirm(`¿ELIMINAR DEFINITIVAMENTE ${selectedIds.size} elementos? ¡Esta acción es IRREVERSIBLE!`)) return;

      const table = activeTab === 'appointments' ? 'appointments' : 'patients';

      try {
        const { error } = await supabase
          .from(table)
          .delete()
          .in('id', Array.from(selectedIds));

        if (error) throw error;

        setSelectedIds(new Set());
        fetchTrash();
      } catch (error) {
        console.error("Error deleting:", error);
        alert("Error al eliminar.");
      }
    };

    const restoreAppointment = async (id) => {
      if (!confirm("¿Restaurar esta cita?")) return;
      await supabase.from('appointments').update({ status: 'pending' }).eq('id', id);
      fetchTrash();
      alert("Cita restaurada.");
    };

    const deleteAppointmentPermanently = async (id) => {
      if (!confirm("¿Eliminar definitivamente? Esta acción no se puede deshacer.")) return;
      await supabase.from('appointments').delete().eq('id', id);
      fetchTrash();
    };

    const restorePatient = async (id) => {
      if (!confirm("¿Restaurar este paciente?")) return;
      await supabase.from('patients').update({ status: 'active' }).eq('id', id);
      fetchTrash();
      alert("Paciente restaurado.");
    };

    const deletePatientPermanently = async (id) => {
      if (!confirm("¿Eliminar definitivamente al paciente y todo su historial? ¡Esta acción es IRREVERSIBLE!")) return;
      await supabase.from('patients').delete().eq('id', id);
      fetchTrash();
    };

    return (
      <div className="space-y-4 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-bold text-red-900 flex items-center text-lg"><Trash2 className="w-5 h-5 mr-2" /> Papelera de Reciclaje</h4>
          <button onClick={fetchTrash} className="text-sm text-blue-600 hover:underline flex items-center"><RefreshCw className="w-3 h-3 mr-1" /> Actualizar</button>
        </div>

        <div className="flex border-b border-gray-200 mb-4">
          <button
            onClick={() => setActiveTab('appointments')}
            className={`px-4 py-2 font-bold text-sm ${activeTab === 'appointments' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Citas Eliminadas ({trashedAppointments.length})
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 font-bold text-sm ${activeTab === 'patients' ? 'border-b-2 border-red-500 text-red-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pacientes Eliminados ({trashedPatients.length})
          </button>
        </div>

        {/* Bulk Actions Toolbar */}
        <div className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded border border-gray-200">
          <label className="flex items-center gap-2 text-sm font-bold text-gray-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={(activeTab === 'appointments' ? trashedAppointments : trashedPatients).length > 0 && selectedIds.size === (activeTab === 'appointments' ? trashedAppointments : trashedPatients).length}
              onChange={toggleSelectAll}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            Seleccionar Todos
          </label>

          {selectedIds.size > 0 && (
            <div className="flex gap-2">
              <button onClick={restoreSelected} className="text-xs bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700 font-bold shadow-sm flex items-center">
                <RefreshCw className="w-3 h-3 mr-1" /> Restaurar ({selectedIds.size})
              </button>
              <button onClick={deleteSelectedPermanently} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 font-bold shadow-sm flex items-center">
                <Trash2 className="w-3 h-3 mr-1" /> Eliminar ({selectedIds.size})
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div></div> : (
            <>
              {activeTab === 'appointments' && (
                trashedAppointments.length === 0 ? <p className="text-center text-gray-400 italic py-8">No hay citas en la papelera.</p> : (
                  <div className="space-y-2">
                    {trashedAppointments.map(item => (
                      <div key={item.id} className={`p-3 rounded border flex justify-between items-center hover:shadow-sm transition-shadow ${selectedIds.has(item.id) ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-bold text-gray-800">{item.patient_name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-2">
                              <Calendar className="w-3 h-3" /> {new Date(item.appointment_date).toLocaleString()}
                            </p>
                            {item.symptoms && <p className="text-xs text-gray-400 italic mt-1">"{item.symptoms}"</p>}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => restoreAppointment(item.id)} className="text-xs bg-white text-green-700 px-3 py-1 rounded hover:bg-green-50 font-bold border border-green-200">Restaurar</button>
                          <button onClick={() => deleteAppointmentPermanently(item.id)} className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 font-bold border border-red-200">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'patients' && (
                trashedPatients.length === 0 ? <p className="text-center text-gray-400 italic py-8">No hay pacientes en la papelera.</p> : (
                  <div className="space-y-2">
                    {trashedPatients.map(item => (
                      <div key={item.id} className={`p-3 rounded border flex justify-between items-center hover:shadow-sm transition-shadow ${selectedIds.has(item.id) ? 'bg-blue-50 border-blue-300' : 'bg-red-50 border-red-100'}`}>
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.has(item.id)}
                            onChange={() => toggleSelect(item.id)}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-bold text-gray-800">{item.nombre}</p>
                            <p className="text-xs text-gray-500">DNI: {item.id} | {item.edad} {(!item.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => restorePatient(item.id)} className="text-xs bg-white text-green-700 px-3 py-1 rounded hover:bg-green-50 font-bold border border-green-200">Restaurar</button>
                          <button onClick={() => deletePatientPermanently(item.id)} className="text-xs bg-white text-red-600 px-3 py-1 rounded hover:bg-red-50 font-bold border border-red-200">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const getNowDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // --- DATOS DEL DOCTOR (Para Impresión) ---
  const DOCTOR_INFO = {
    nombre: "Dr. Walter J. Florez Guerra",
    especialidad: "Médico Cirujano - Otorrinolaringólogo",
    credenciales: "CMP 64028 - RNE 34394",
    contacto: "wflorez16@gmail.com - 955449503"
  };

  // --- VADEMÉCUM ESTRUCTURADO ---
  const VADEMECUM_TABULAR = {
    "OÍDO": [
      { name: "Ciriax Otic", med: "Ciprofloxacino 0,2% + Hidrocortisona 1% (Ciriax otic)", cant: "1 Got", ind: "3 gotas c/8h (en oido   ) 5 minutos y luego dejar que salga", via: "TOP", dur: "10 dias" },
      { name: "Ac. Acético", med: "Ac. Acetico 2% + Alcohol isopropilico 70º CSP 30 ml", cant: "1 Got", ind: "3 gotas c/8h (en oido   ) 5 minutos y luego dejar que salga", via: "TOP", dur: "10 días" },
      { name: "Zaldiar", med: "Tramadol/Paracetamol (Zaldiar)", cant: "9 Tab", ind: "1 tableta c/8 h D - A - C (primeros dias, condicional a dolor intenso)", via: "VO", dur: "3 dias" },
      { name: "Paracetamol 500", med: "Paracetamol 500 mg", cant: "9 Tab", ind: "1 tableta c/8 h D - A - C (condicional a dolor moderado)", via: "VO", dur: "3 dias" },
      { name: "Otozambon", med: "Otozambon", cant: "1 Got", ind: "3 gotas c/8h (en oidos) 5 minutos y luego retirar", via: "TOP", dur: "7 dias" },
      { name: "Aceite Almendras", med: "Aceite de almendra o de bebe o glicerina", cant: "1 Fco", ind: "3 gotas c/24 h en ambos oidos", via: "TOP", dur: "30 dias" },
      { name: "Prednisona 50", med: "Prednisona 50 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
      { name: "Prednisona 20", med: "Prednisona 20 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
      { name: "Prednisona 5 (10)", med: "Prednisona 5 mg", cant: "10 Tab", ind: "2 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
      { name: "Prednisona 5 (5)", med: "Prednisona 5 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am) con el desayuno", via: "VO", dur: "5 dias" },
      { name: "Lipoflavonoides", med: "Lipoflavonoides (Ringing Ears)", cant: "1 Fco", ind: "1 tab c/24h", via: "VO", dur: "30 dias" },
      { name: "Betahistina 16", med: "Betahistina (Microser) 16 mg", cant: "14 Tab", ind: "16 mg (1 tableta) c/12h", via: "VO", dur: "7 dias" },
      { name: "Acetazolamida", med: "Acetazolamida 250 mg", cant: "10 Tab", ind: "1 tableta c/24h 8 am (consumir con un platano diario)", via: "VO", dur: "10 dias" },
      { name: "Dimenhidrinato", med: "Dimenhidrinato (gravol)", cant: "10 Tab", ind: "1 tableta condiciona a nauseas y vomitos", via: "VO", dur: "10 dias" },
      { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
      { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
      { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (Amoxidal plus)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
      { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" }
    ],
    "NARIZ": [
      { name: "Neilmed", med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
      { name: "Ryaltris", med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
      { name: "Rupatadina", med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
      { name: "Deflazacort 30", med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
      { name: "Breath Right", med: "Respira Mejor (Breath Right)", cant: "30 Tiras", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 dias" },
      { name: "Hisaler D", med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "7 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "7 dias" },
      { name: "Afrin", med: "Oximetazolina (AFRIN SP 0.05 %)", cant: "1 Sol", ind: "1 - 2 gotas c/24h en cada fosa nasal o fosa nasal mas obstruida", via: "TOP", dur: "SOLO 3 dias!" },
      { name: "Montelukast", med: "Montelukast 10 mg", cant: "30 Tab", ind: "1 tableta c/24h (17:00 h) (alejado de los alimentos por 2 horas)", via: "VO", dur: "30 dias" },
      { name: "Rinomar Hiper", med: "Cloruro de Sodio (Rinomar Hipertonico)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
      { name: "Ryaltris (2)", med: "Mometasona + Olopatadina (Ryaltris)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Nasonex", med: "Mometasona (Nasonex) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Fluimicil", med: "Acetilcisteina (fluimicil) 200 mg", cant: "10 Sob", ind: "1 sobre en un vaso con agua c/12h", via: "VO", dur: "5 dias" },
      { name: "Probiocyan", med: "Lactobacillus plantarum (Probiocyan)", cant: "30 Tab", ind: "1 cap c/24h por 30 dias", via: "VO", dur: "30 dias" },
      { name: "Rinosal B", med: "Budesonida (Rinosal B, Corbuton)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
      { name: "Anginovag", med: "Anginovag (spray bucal)", cant: "1 Fco", ind: "2 puff c/8 h en boca", via: "TOP", dur: "5 dias" },
      { name: "Cloruro Sodio 1L", med: "Cloruro de sodio 0.9% 1 L", cant: "5 Fco", ind: "19.9 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Shampoo J&J", med: "Shampoo J&J", cant: "1 Fco", ind: "0.1 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Jeringa 20", med: "Jeringa 20 ml", cant: "15 Unidad", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Rinosal B Spray", med: "Budesonida (Rinosal B, corbuton) SPRAY NASAL", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
      { name: "Libbera", med: "Levocetirizina (Libbera)", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
      { name: "Deflazacort 30 (2)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h con el desayuno!", via: "VO", dur: "5 dias" },
      { name: "Omeprazol", med: "Omeprazol 20 mg", cant: "30 Tab", ind: "1 tableta c/24h 30 minutos antes del desayuno", via: "VO", dur: "30 dias" },
      { name: "Claritromicina", med: "Claritromicina 500 mg", cant: "30 Tab", ind: "250 mg (1/2 tableta) c/24 h 8 am", via: "VO", dur: "30 dias" },
      { name: "Amox/Clav 500 (2)", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A.- C)", via: "VO", dur: "14 dias" },
      { name: "Amox/Clav 875 (2)", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
      { name: "Amox/Clav Jbe (2)", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
      { name: "Levofloxacino 750 (3)", med: "Levofloxacino 750 mg (Ponaris)", cant: "3 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "3 dias" },
      { name: "Levofloxacino 500 (7)", med: "Levofloxacino 500 mg (Ponaris)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
      { name: "Levofloxacino 750 (2)", med: "Levofloxacino 750 mg (Ponaris)", cant: "2 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "2 dias" },
      { name: "Levofloxacino 500 (8)", med: "Levofloxacino 500 mg (Ponaris)", cant: "8 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "8 dias" }
    ],
    "LARINGE": [
      { name: "Rinomar", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "2 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
      { name: "Ryaltris", med: "Mometasona + Olopatadina (Ryaltris)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Hisaler D", med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
      { name: "Deflazacort 30", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h (8 am!!) (con el desayuno!)", via: "VO", dur: "5 dias" },
      { name: "Breath Right", med: "Respira Mejor (Breath Right)", cant: "30 Tiras", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 dias" },
      { name: "Afrin", med: "Oximetazolina (AFRIN SP 0.05 %)", cant: "1 Sol", ind: "1 - 2 gotas c/24h en cada fosa nasal o fosa nasal mas obstruida", via: "TOP", dur: "SOLO 3 dias!" },
      { name: "Montelukast", med: "Montelukast 10 mg", cant: "30 Tab", ind: "1 tableta c/24h (17:00 h) (alejado de los alimentos por 2 horas)", via: "VO", dur: "30 dias" },
      { name: "Rinomar (2)", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
      { name: "Flucomixx", med: "Fluticasona (Flucomixx) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Nasonex", med: "Mometasona (Nasonex) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Allegra 180", med: "Fexofenadina (Allegra) 180 mg", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
      { name: "Deflazacort 30 (2)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
      { name: "Fluimicil", med: "Acetilcisteina (fluimicil) 200 mg", cant: "10 Sob", ind: "1 sobre en un vaso con agua c/12h", via: "VO", dur: "5 dias" },
      { name: "Rinosal B", med: "Budesonida (Rinosal B, Corbuton)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
      { name: "Anginovag", med: "Anginovag (spray bucal)", cant: "1 Fco", ind: "2 puff c/8 h en boca", via: "TOP", dur: "5 dias" },
      { name: "Cloruro Sodio 1L", med: "Cloruro de sodio 0.9% 1 L", cant: "5 Fco", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Jeringa 20", med: "Jeringa 20 ml", cant: "15 Unidad", ind: "20 ml c/4-8 h en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Rinosal B Spray", med: "Budesonida (Rinosal B, corbuton) SPRAY NASAL", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "TOP", dur: "15 dias" },
      { name: "Libbera", med: "Levocetirizina (Libbera)", cant: "5 Tab", ind: "1 tableta c/24 h (noche)", via: "VO", dur: "5 dias" },
      { name: "Deflazacort 30 (3)", med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tableta c/24 h con el desayuno!", via: "VO", dur: "5 dias" },
      { name: "Esomeprazol 40", med: "Esomeprazol 40 mg", cant: "30 Tab", ind: "1 tableta c/24h 30 minutos antes del desayuno", via: "VO", dur: "30 dias" },
      { name: "Claritromicina", med: "Claritromicina 500 mg", cant: "30 Tab", ind: "250 mg (1/2 tableta) c/24 h 8 am", via: "VO", dur: "30 dias" },
      { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A.- C)", via: "VO", dur: "14 dias" },
      { name: "Amox/Clav 500 (2)", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
      { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
      { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
      { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
      { name: "Amitriptilina", med: "Amitriptilina 25 mg", cant: "30 Tab", ind: "1 tab c/24h 8 pm", via: "VO", dur: "30 dias" }
    ],
    "NIÑOS": [
      { name: "Neilmed", med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
      { name: "Nasonex", med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal", via: "NAS", dur: "15 dias" },
      { name: "Loratadina Jbe", med: "Loratadina 5mg/5ml", cant: "1 Jbe", ind: "    ml c/24h 8 pm o condicional a rinorrea", via: "VO", dur: "7 dias" },
      { name: "Hisaler Jbe", med: "Hisaler 5mg/5ml", cant: "1 Jbe", ind: "    ml c/24h 8 pm o condicional a rinorrea", via: "VO", dur: "7 dias" },
      { name: "Amoxicilina Jbe", med: "Amoxicilina 250 mg/5 ml", cant: "1 Jbe", ind: "    ml c/8h D - A - C", via: "VO", dur: "5 dias" },
      { name: "Panadol Jbe", med: "Paracetamol (Panadol) 160 mg/5 ml", cant: "1 Jbe", ind: "    ml c/8h D - A - C Condicional a dolor o fiebre", via: "VO", dur: "5 dias" },
      { name: "Amox/Clav Jbe", med: "Amoxicilina/Ac clavulanico 250 mg/5ml", cant: "2 Jbe", ind: "    ml c/8 h (M-T-N)", via: "VO", dur: "10 dias" },
      { name: "Argirol", med: "Argirol 2%", cant: "1 Fco", ind: "2 gotas c/12h en cada fosa nasal", via: "TOP", dur: "5 dias" },
      { name: "Rinomar", med: "Cloruro de Sodio 0.9% (Rinomar)", cant: "1 Fco", ind: "3 puff c/8 h (M-T-N) en cada fosa nasal", via: "NAS", dur: "30 dias" },
      { name: "Hisaler Tab", med: "Hisaler", cant: "7 Tab", ind: "1 tab c/24 8 pm", via: "VO", dur: "7 dias" },
      { name: "Tetraciclina", med: "Tetraciclina (tetralan)", cant: "1 Ung", ind: "aplic en nariz c/12h", via: "TOP", dur: "7 dias" },
      { name: "Salbutamol 6h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/6 h Inhalada por boca", via: "Inh", dur: "5 dias" },
      { name: "Salbutamol 8h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/8 h Inhalada por boca", via: "Inh", dur: "5 dias" },
      { name: "Salbutamol 12h", med: "SALBUTAMOL 100 µg/Dosis Aerosol", cant: "1 Fco", ind: "2 puff c/12 h Inhalada por boca", via: "Inh", dur: "5 dias" },
      { name: "Amox/Clav 500", med: "Amoxicilina/Ac. Clavunico 500 mg", cant: "42 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "14 dias" },
      { name: "Amoxicilina 500", med: "Amoxicilina 500 mg", cant: "21 Tab", ind: "1 tableta c/8 h (D - A. - C)", via: "VO", dur: "7 dias" },
      { name: "Amox/Clav 875", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" },
      { name: "Amox/Clav 875 (2)", med: "Amoxicilina/Ac. Clavunico 875 mg (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (D - C)", via: "VO", dur: "10 dias" }
    ]
  };

  // --- DIAGNÓSTICOS ---
  const DIAGNOSTICOS_COMUNES = {
    "NARIZ Y SENOS PARANASALES": [
      { label: "Rinitis alérgica", cie10: "J30.4" },
      { label: "Rinitis vasomotora", cie10: "J30.0" },
      { label: "Desviación del tabique nasal", cie10: "J34.2" },
      { label: "Rinosinusitis aguda", cie10: "J01.9" },
      { label: "Rinosinusitis crónica", cie10: "J32.9" },
      { label: "Rinofaringitis aguda (Resfriado común)", cie10: "J00" },
      { label: "Poliposis nasosinusal", cie10: "J33.9" },
      { label: "Hipertrofia de cornetes", cie10: "J34.3" },
      { label: "Vestibulitis nasal / Forúnculo", cie10: "J34.0" },
      { label: "Traumatismo superficial de la nariz", cie10: "S00.3" },
      { label: "Fractura nasal (huesos propios)", cie10: "S02.2" },
      { label: "Epistaxis", cie10: "R04.0" },
      { label: "Várices septales", cie10: "J34.8" },
      { label: "Hiposmia / Anosmia", cie10: "R43.0" },
      { label: "Cuerpo extraño en nariz", cie10: "T17.1" }
    ],
    "OÍDO": [
      { label: "Otitis media aguda", cie10: "H66.9" },
      { label: "Otitis media serosa", cie10: "H65.9" },
      { label: "Otitis media crónica", cie10: "H66.5" },
      { label: "Otitis externa aguda", cie10: "H60.5" },
      { label: "Tapón de cerumen", cie10: "H61.2" },
      { label: "Disfunción de Trompa de Eustaquio", cie10: "H69.9" },
      { label: "Perforación timpánica", cie10: "H72.9" },
      { label: "Tinnitus", cie10: "H93.1" },
      { label: "Hipoacusia neurosensorial bilateral", cie10: "H90.3" },
      { label: "Hipoacusia neurosensorial unilateral", cie10: "H90.4" },
      { label: "Presbiacusia", cie10: "H91.1" },
      { label: "Síndrome vestibular", cie10: "H81.9" },
      { label: "Vértigo Posicional Paroxístico Benigno (VPPB)", cie10: "H81.1" },
      { label: "Enfermedad de Ménière", cie10: "H81.0" },
      { label: "Cuerpo extraño en oído", cie10: "T16" }
    ],
    "FARINGE, LARINGE Y CUELLO": [
      { label: "Disfonía", cie10: "R49.0" },
      { label: "Faringitis aguda", cie10: "J02.9" },
      { label: "Faringitis crónica", cie10: "J31.2" },
      { label: "Amigdalitis aguda", cie10: "J03.9" },
      { label: "Amigdalitis crónica", cie10: "J35.0" },
      { label: "Reflujo faringolaríngeo", cie10: "K21.9" },
      { label: "Nódulos de cuerda vocal", cie10: "J38.2" },
      { label: "Pólipo de cuerda vocal", cie10: "J38.1" },
      { label: "Quiste de cuerda vocal", cie10: "J38.3" },
      { label: "Adenomegalia / Ganglio linfático", cie10: "R59.0" },
      { label: "Cuerpo extraño en garganta/faringe", cie10: "T17.2" }
    ],
    "PEDIATRÍA (Diagnósticos frecuentes en niños)": [
      { label: "Rinofaringitis aguda", cie10: "J00" },
      { label: "Hipertrofia de adenoides", cie10: "J35.2" },
      { label: "Hipertrofia de amígdalas y adenoides", cie10: "J35.3" },
      { label: "Otitis media aguda", cie10: "H66.9" },
      { label: "Otitis media serosa", cie10: "H65.9" },
      { label: "Cuerpo extraño en orificio nasal", cie10: "T17.1" },
      { label: "Cuerpo extraño en oído", cie10: "T16" },
      { label: "Frenillo lingual corto (Anquiloglosia)", cie10: "Q38.1" }
    ]
  };

  const EXAM_TEMPLATES = {
    oido: [
      { label: "Normal", text: "CAE permeable, piel integra. Tímpano íntegro, nacarado, triángulo luminoso presente." },
      { label: "Tapón", text: "CAE obstruido 100% por cerumen impactado." },
      { label: "OMA", text: "Tímpano eritematoso, abombado, pérdida de triángulo luminoso." },
      { label: "OMS", text: "Tímpano íntegro, opaco/ámbar, niveles hidroaéreos." },
      { label: "OE", text: "CAE edematoso, secreción purulenta. Dolor tracción." }
    ],
    nariz: [
      { label: "Normal", text: "Fosas permeables. Mucosa rosada. Cornetes eutróficos. Tabique central." },
      { label: "Rinitis", text: "Mucosa pálida, cornetes hipertróficos, moco hialino." },
      { label: "Desv D", text: "Desviación septal obstructiva a DERECHA." },
      { label: "Desv I", text: "Desviación septal obstructiva a IZQUIERDA." }
    ],
    garganta: [
      { label: "Normal", text: "Orofaringe rosada. Amígdalas grado I. Úvula central." },
      { label: "Amig", text: "Amígdalas hipertróficas, eritematosas, exudado purulento." },
      { label: "RFL", text: "Edema de aritenoides, eritema retrocricoideo." }
    ]
  };

  // --- CATÁLOGO CON INDICACIONES Y TRATAMIENTOS (SMART PROTOCOLS) ---
  const CATALOGO_MEDICO = {
    "NARIZ Y SENOS PARANASALES (Adultos)": [
      {
        label: "Rinitis Alérgica (Estándar)", cie10: "J30.4",
        trat: [
          { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
          { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
          { med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
          { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" }
        ],
        indic: ""
      },
      {
        label: "Rinitis + Hipertrofia Cornetes / Desviación Septal", cie10: "J30.4",
        extraDiags: [{ code: "J34.3", desc: "Hipertrofia de Cornetes" }, { code: "J34.2", desc: "Desviación Septal" }],
        trat: [
          { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
          { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
          { med: "Cetirizina + Pseudoefedrina (Hisaler D)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
          { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
          { med: "Tiras nasales", cant: "1 Caja", ind: "Colocar sobre dorso nasal (cada noche o durante ejercicio)", via: "TOP", dur: "30 días" }
        ],
        indic: ""
      },
      {
        label: "Rinosinusitis Aguda / Crónica", cie10: "J01.9",
        trat: [
          { med: "Cloruro de Sodio (Neilmed)", cant: "2 Fco", ind: "3 seg c/8 h (M-T-N) en cada fosa nasal (luego sonar la nariz)", via: "NAS", dur: "30 dias" },
          { med: "Mometasona + Olopatadina (Ryaltris) (spray nasal)", cant: "1 Fco", ind: "2 puff - c/24h (noche) en cada fosa nasal (mantener en la nariz)", via: "NAS", dur: "15 dias" },
          { med: "Rupatadina 10 mg (Rupatadina)", cant: "10 Tab", ind: "1 tableta c/24 h (noche) alejada de los alimentos", via: "VO", dur: "10 dias" },
          { med: "Deflazacort 30 mg (aflazacort)", cant: "5 Tab", ind: "1 tableta c/24 h (con el desayuno!)", via: "VO", dur: "5 dias" },
          { med: "Levofloxacino 750 mg (Ponaris)", cant: "3 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "3 dias" },
          { med: "Levofloxacino 500 mg (Ponaris)", cant: "7 Tab", ind: "1 tableta c/24 h (8 pm)", via: "VO", dur: "7 dias" },
          { med: "Amoxicilina/Ac. Clavunico 1g (augmentin)", cant: "20 Tab", ind: "1 tableta c/12 h (M-N)", via: "VO", dur: "10 dias" }
        ],
        indic: ""
      },
      {
        label: "Colapso Valvular Nasal", cie10: "J34.8",
        trat: [
          { med: "Tiras nasales (Breath Right/Wayra)", cant: "1 Caja", ind: "Cada noche o ejercicio", via: "TOP", dur: "30 días" },
          { med: "Lavados nasales", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "30 días" },
          { med: "Antihistamínico", cant: "10 Tab", ind: "1 tab c/24h", via: "VO", dur: "10 días" },
          { med: "Corticoide nasal", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" }
        ],
        indic: ""
      },
      {
        label: "Epistaxis / Várices Septales", cie10: "R04.0",
        trat: [
          { med: "Tetraciclina (Tetralan) ungüento", cant: "1 Tubo", ind: "1 aplic. c/12h", via: "TOP", dur: "7 días" },
          { med: "Loratadina 10 mg", cant: "7 Tab", ind: "1 tab c/24h", via: "VO", dur: "7 días" },
          { med: "Lavados nasales suaves", cant: "1 Kit", ind: "c/12h", via: "NAS", dur: "10 días" }
        ],
        indic: ""
      },
      {
        label: "Poliposis Nasosinusal", cie10: "J33.9",
        trat: [
          { med: "Lavados nasales (con budesonida opcional)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "30 días" },
          { med: "Budesonida (Rinosal B)", cant: "1 Fco", ind: "2 puff c/24h", via: "NAS", dur: "15 días" },
          { med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tab c/24h", via: "VO", dur: "5 días" },
          { med: "Antibiótico (Si sobreinfección)", cant: "1 Caja", ind: "Según indicación", via: "VO", dur: "7 días" }
        ],
        indic: ""
      }
    ],
    "OÍDO (Adultos)": [
      {
        label: "Otitis Externa (Infecciosa)", cie10: "H60.3",
        trat: [
          { med: "Ciprofloxacino + Hidrocortisona (Ciriax Otic)", cant: "1 Fco", ind: "3 gotas c/8h", via: "TOP", dur: "10 días" },
          { med: "Ac. Acético + Alcohol isopropílico", cant: "1 Fco", ind: "3 gotas c/8h (para secar/hongos)", via: "TOP", dur: "10 días" },
          { med: "Paracetamol o Zaldiar", cant: "10 Tab", ind: "Condicional a dolor", via: "VO", dur: "3 días" }
        ],
        indic: "No mojar el oído."
      },
      {
        label: "Otitis Media / Serosa / Disfunción Tubárica", cie10: "H65.9",
        trat: [
          { med: "Lavados nasales + Spray (Ryaltris/Nasonex)", cant: "1 Kit", ind: "c/8h + puff noche", via: "NAS", dur: "15 días" },
          { med: "Antihistamínico (Rupatadina/Cetirizina)", cant: "10 Tab", ind: "1 tab c/24h", via: "VO", dur: "10 días" },
          { med: "Deflazacort 30 mg", cant: "5 Tab", ind: "1 tab c/24h", via: "VO", dur: "5 días" },
          { med: "Amoxicilina/Clavulánico 875mg (Si bacteriana)", cant: "14 Tab", ind: "1 tab c/12h", via: "VO", dur: "7-10 días" }
        ],
        indic: ""
      },
      {
        label: "Tinnitus / Hipoacusia Neurosensorial", cie10: "H93.1",
        trat: [
          { med: "Tratamiento nasal base (si componente tubárico)", cant: "-", ind: "Ver esquema nasal", via: "NAS", dur: "-" },
          { med: "Lipoflavonoides (Ringing Ears)", cant: "1 Fco", ind: "1 tab c/12-24h", via: "VO", dur: "15-30 días" },
          { med: "Clonazepam 0.5 mg", cant: "10 Tab", ind: "1/2 tab c/noche", via: "VO", dur: "10 días" },
          { med: "Prednisona (Si Hipoacusia Súbita)", cant: "-", ind: "Esquema descendente (50->20->5)", via: "VO", dur: "Variable" }
        ],
        indic: ""
      },
      {
        label: "Vértigo / Síndrome de Ménière", cie10: "H81.0",
        trat: [
          { med: "Betahistina (Microser) 16-24 mg", cant: "30 Tab", ind: "1 tab c/8h o c/12h", via: "VO", dur: "7-30 días" },
          { med: "Acetazolamida 250 mg", cant: "10 Tab", ind: "1 tab c/24h (8am) con un plátano diario", via: "VO", dur: "5-10 días" }
        ],
        indic: ""
      },
      {
        label: "Tapón de Cerumen", cie10: "H61.2",
        trat: [
          { med: "Otozambon", cant: "1 Fco", ind: "3 gotas c/8h (ablandar)", via: "TOP", dur: "5-7 días" },
          { med: "Aceite de almendras/glicerina", cant: "1 Fco", ind: "3 gotas c/24h (mantenimiento)", via: "TOP", dur: "30 días" }
        ],
        indic: ""
      }
    ],
    "FARINGE, LARINGE Y OTROS": [
      {
        label: "Rinofaringitis Aguda / Amigdalitis", cie10: "J03.9",
        trat: [
          { med: "Amoxicilina/Clavulánico 875mg o Azitromicina 500mg", cant: "1 Caja", ind: "Si es bacteriana", via: "VO", dur: "5-7 días" },
          { med: "Celecoxib o Ibuprofeno", cant: "10 Tab", ind: "1 tab c/12h o c/8h", via: "VO", dur: "3-5 días" },
          { med: "Anginovag spray", cant: "1 Fco", ind: "2 puff c/8h", via: "TOP", dur: "5 días" }
        ],
        indic: ""
      },
      {
        label: "Reflujo Faringolaríngeo (RFL) / Disfonía", cie10: "K21.9",
        trat: [
          { med: "Esomeprazol/Omeprazol 20-40 mg", cant: "30 Tab", ind: "1 tab 30 min antes del desayuno", via: "VO", dur: "30 días" },
          { med: "Tratamiento nasal (Si goteo postnasal)", cant: "-", ind: "Ryaltris + Rupatadina", via: "NAS", dur: "-" }
        ],
        indic: ""
      },
      {
        label: "Dolor Neuropático / Neuralgia", cie10: "M79.2",
        trat: [
          { med: "Amitriptilina 25 mg", cant: "21 Tab", ind: "1 tab c/24h (8 pm)", via: "VO", dur: "21 días" },
          { med: "Complejo B", cant: "1 Caja", ind: "Coadyuvante", via: "VO", dur: "15 días" }
        ],
        indic: ""
      }
    ],
    "PEDIATRÍA (Niños)": [
      {
        label: "Rinitis Alérgica (Leve)", cie10: "J30.4",
        trat: [
          { med: "Cloruro de Sodio (Neilmed/Rinobebe)", cant: "1 Fco", ind: "2-3 seg c/8h en cada fosa nasal (luego sonar nariz)", via: "NAS", dur: "30 días" },
          { med: "Loratadina 5mg/5ml (Jbe)", cant: "1 Fco", ind: "1-3 ml (según peso/edad) c/24h (8 pm)", via: "VO", dur: "7 días" },
          { med: "Tetraciclina (Tetralan) Ungüento", cant: "1 Tubo", ind: "1 aplic. en nariz c/12h (si hay vestibulitis)", via: "TOP", dur: "7 días" }
        ],
        indic: ""
      },
      {
        label: "Rinitis Alérgica (Mod-Sev) / Hipertrofia Adenoides", cie10: "J30.4",
        extraDiags: [{ code: "J35.2", desc: "Hipertrofia de Adenoides" }],
        trat: [
          { med: "Cloruro de Sodio (Neilmed/Rinomar)", cant: "1 Fco", ind: "3 seg c/8h en cada fosa nasal", via: "NAS", dur: "30 días" },
          { med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "1-2 puff c/24h (noche)", via: "NAS", dur: "15-30 días" },
          { med: "Loratadina o Desloratadina (Jbe)", cant: "1 Fco", ind: "Dosis según peso, c/24h (8 pm)", via: "VO", dur: "7 días" },
          { med: "Argirol 2% (Opcional)", cant: "1 Fco", ind: "2 gotas c/12h (si hay adenoiditis)", via: "NAS", dur: "5 días" }
        ],
        indic: ""
      },
      {
        label: "Otitis Media Aguda", cie10: "H66.9",
        trat: [
          { med: "Amoxicilina (250mg/5ml Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "5-7 días" },
          { med: "Ibuprofeno/Paracetamol", cant: "1 Fco", ind: "Condicional a dolor/fiebre", via: "VO", dur: "3-5 días" },
          { med: "Lavados nasales (Neilmed/Rinomar)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "7 días" }
        ],
        indic: ""
      },
      {
        label: "Otitis Media Serosa / Ototubaritis", cie10: "H65.9",
        trat: [
          { med: "Amoxicilina/Ac. Clavulánico (Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "10 días" },
          { med: "Mometasona (Nasonex)", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" },
          { med: "Loratadina (Jbe)", cant: "1 Fco", ind: "c/24h", via: "VO", dur: "7 días" },
          { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "15 días" }
        ],
        indic: ""
      },
      {
        label: "Rinosinusitis Aguda", cie10: "J01.9",
        trat: [
          { med: "Amoxicilina/Ac. Clavulánico (Jbe)", cant: "1 Fco", ind: "Dosis ponderal c/8h", via: "VO", dur: "10 días" },
          { med: "Mometasona", cant: "1 Fco", ind: "1 puff c/24h", via: "NAS", dur: "15 días" },
          { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "10 días" }
        ],
        indic: ""
      },
      {
        label: "Rinofaringitis Aguda", cie10: "J00",
        trat: [
          { med: "Amoxicilina (Jbe)", cant: "1 Fco", ind: "c/8h", via: "VO", dur: "5 días" },
          { med: "Loratadina (Jbe)", cant: "1 Fco", ind: "c/24h", via: "VO", dur: "7 días" },
          { med: "Lavados nasales (Neilmed)", cant: "1 Kit", ind: "c/8h", via: "NAS", dur: "5 días" }
        ],
        indic: ""
      }
    ]
  };



  // --- AGENDA LOGIC ---
  const [showConfirmed, setShowConfirmed] = useState(false); // Toggle for Agenda view
  const [showAgendaImportModal, setShowAgendaImportModal] = useState(false);
  const [agendaImportText, setAgendaImportText] = useState('');

  const handleAgendaImport = async () => {
    if (!agendaImportText.trim()) return;
    const lines = agendaImportText.trim().split('\n');
    const newAppointments = [];

    for (const line of lines) {
      const cols = line.split('\t');
      if (cols.length < 2) continue; // Relaxed: Only need Date and Time minimum

      try {
        // 1. Parse Date (DD/MM/YYYY -> YYYY-MM-DD)
        const [d, m, y] = cols[0].trim().split('/');
        const dateStr = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;

        // 2. Parse Time (2.2 -> 14:20, 3 -> 15:00)
        let timeStr = "00:00";
        const rawTime = cols[1]?.trim() || "00:00";
        if (rawTime.includes('.')) {
          const [h, min] = rawTime.split('.');
          let hour = parseInt(h);
          let minute = parseInt(min);

          // Adjust logic: 2.2 -> 2:20 (not 2:02). 2.4 -> 2:40.
          if (minute < 10 && rawTime.split('.')[1].length === 1) minute *= 10;

          if (hour < 8) hour += 12; // Assume PM for small numbers
          timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        } else {
          let hour = parseInt(rawTime);
          if (isNaN(hour)) hour = 0;
          if (hour < 8 && hour !== 0) hour += 12; // Assume PM
          timeStr = `${hour.toString().padStart(2, '0')}:00`;
        }

        // 3. Construct Appointment Date (UTC)
        const appointmentDate = new Date(`${dateStr}T${timeStr}:00`).toISOString();

        // 4. Map Columns (Relaxed)
        const reason = cols[2]?.trim() || '';
        const dni = cols[3]?.trim() || '';
        const name = cols[4]?.trim() || 'Paciente Importado'; // Default name if missing
        const age = cols[5]?.trim() || '';
        const sex = cols[6]?.trim() || '';
        const occupation = cols[7]?.trim() || '';
        const district = cols[8]?.trim() || '';
        const phone = cols[9]?.trim() || '';
        const email = cols[10]?.trim() || '';
        // New columns for History and Reference
        const referral = cols[11]?.trim() || '';
        const illness = cols[12]?.trim() || '';
        const meds = cols[13]?.trim() || '';
        const allergies = cols[14]?.trim() || '';
        const surgeries = cols[15]?.trim() || '';

        // 5. Construct Symptoms String (Keep for display in Agenda)
        const details = [
          reason,
          `[Ticket: IMPORT]`
        ].filter(Boolean).join(' | ');

        newAppointments.push({
          clinic_id: user.clinicId,
          patient_name: name,
          patient_phone: phone,
          patient_dni: dni,           // Mapped
          patient_age: age,           // Mapped
          patient_sex: sex,           // Mapped
          patient_occupation: occupation, // Mapped
          patient_district: district, // Mapped
          patient_email: email,       // Mapped
          referral_source: referral,  // Mapped
          chronic_illnesses: illness, // Mapped
          medications: meds,          // Mapped
          allergies: allergies,       // Mapped
          surgeries: surgeries,       // Mapped
          patient_reason: reason,     // Mapped (Motivo)
          symptoms: details,
          appointment_date: appointmentDate,
          status: 'pending'
        });

      } catch (e) {
        console.error("Error parsing line:", line, e);
      }
    }

    if (newAppointments.length > 0) {
      const { error } = await supabase.from('appointments').insert(newAppointments);
      if (error) {
        alert("Error al importar: " + error.message);
      } else {
        alert(`Se importaron ${newAppointments.length} citas correctamente.`);
        setShowAgendaImportModal(false);
        setAgendaImportText('');
        fetchAppointments();
      }
    } else {
      alert("No se pudieron procesar las líneas. Verifica el formato.");
    }
  };

  const fetchAppointments = async () => {
    if (!user.clinicId) return;
    setLoadingAppointments(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', user.clinicId)
        .neq('status', 'trash') // Exclude trash
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  const confirmAppointment = async (apt) => {
    // Check if we are currently editing this appointment
    const isEditing = editingAppointment?.id === apt.id;
    const dateToUse = isEditing ? editingAppointment.date : apt.appointment_date;

    // Get time - either from editing, from appointment_time field, or extract from appointment_date
    let timeToUse;
    if (isEditing) {
      timeToUse = editingAppointment.time;
    } else if (apt.appointment_time) {
      timeToUse = apt.appointment_time;
    } else if (apt.appointment_date) {
      // Extract time from appointment_date
      const d = new Date(apt.appointment_date);
      timeToUse = d.toTimeString().slice(0, 5);
    }

    if (!dateToUse || !timeToUse) {
      alert("Por favor, asigna una fecha y hora antes de confirmar.");
      // Activar modo edición para este cita si no lo está
      if (!isEditing) {
        const d = new Date(apt.appointment_date || new Date());
        setEditingAppointment({
          id: apt.id,
          date: d.toISOString().split('T')[0],
          time: d.toTimeString().slice(0, 5)
        });
      }
      return;
    }

    // Construct full date object
    const fullDate = new Date(`${dateToUse}T${timeToUse}:00`);

    // Only ask for confirmation if editing (changing date/time)
    if (isEditing) {
      if (!confirm(`¿Confirmar cita para ${apt.patient_name} el ${fullDate.toLocaleDateString()} a las ${timeToUse}? \n\nPasará a la lista de Triaje del día correspondiente.`)) return;
    }

    try {
      // If editing, we need to update date/time AND status
      const updates = {
        status: 'confirmed',
        triage_status: 'pending'
      };

      if (isEditing) {
        updates.appointment_date = fullDate.toISOString();
      }

      const { error } = await supabase
        .from('appointments')
        .update(updates)
        .eq('id', apt.id);

      if (error) throw error;

      // Update local state
      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, ...updates } : a));

      // If we were editing, clear edit state
      if (isEditing) setEditingAppointment(null);

      // No alert needed - visual feedback from state change is enough
    } catch (error) {
      console.error("Error confirming appointment:", error);
      alert("Error al confirmar cita.");
    }
  };

  useEffect(() => {
    if (view === 'agenda') {
      fetchAppointments();
    }
  }, [view]);

  const handleConvertToPatient = async (apt) => {
    // 1. Check if patient already exists (even in trash) to avoid overwriting history
    let existingPatient = null;
    if (apt.patient_dni) {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', apt.patient_dni)
        .maybeSingle();

      if (data) {
        // If patient exists, we must use their data (especially history/consultations)
        // We restore the structure from the 'data' JSONB column if available
        existingPatient = { ...data.data, id: data.id };
        console.log("Found existing patient:", existingPatient);

        if (confirm(`El paciente ${existingPatient.nombre} ya existe en la base de datos (posiblemente en papelera). ¿Desea cargar su historial previo?`)) {
          // If user accepts, we use existing data
        } else {
          // If user refuses, we start fresh (WARNING: this will overwrite if saved)
          existingPatient = null;
        }
      }
    }

    // 2. Prepare Form Data
    if (existingPatient) {
      // MERGE: Use existing patient data, but update current appointment details if needed
      setFormData({
        ...existingPatient,
        // Ensure we don't lose the current appointment context (e.g. date)
        fechaCita: getNowDate(),
        // Reset current consultation fields to empty for the NEW consultation
        resumen: '',
        examenOido: '',
        examenNariz: '',
        examenGarganta: '',
        diagnosticos: [],
        receta: [],
        indicaciones: ''
      });
      setIsNewPatient(false); // It's an existing patient
    } else {
      // NEW PATIENT (or overwrite)
      setFormData({
        // Explicitly reset medical fields to avoid carrying over data from previous patient
        resumen: apt.patient_reason || '', // Load reason if available
        examenOido: '',
        examenNariz: '',
        examenGarganta: '',
        diagnosticos: [],
        receta: [],
        indicaciones: '',
        fechaCita: getNowDate(), // Default to today for the new consultation record
        nombre: apt.patient_name,
        celular: apt.patient_phone || '',
        id: apt.patient_dni || '',
        edad: apt.patient_age || '',
        sexo: apt.patient_sex || '',
        ocupacion: apt.patient_occupation || '',
        procedencia: apt.patient_district || '',
        email: apt.patient_email || '',
        fechaNacimiento: apt.patient_dob || '',
        referencia: `${apt.referral_source || ''} ${apt.referral_detail ? `(${apt.referral_detail})` : ''}`.trim(),
        // Map medical history to individual fields
        enfermedades: apt.chronic_illnesses || '',
        medicamentos: apt.medications || '',
        alergias: apt.allergies || '',
        cirugias: apt.surgeries || ''
      });
      setIsNewPatient(true);
    }

    navigate('form');
  };

  // Cargar pacientes al inicio


  // Cargar pacientes al inicio
  useEffect(() => {
    if (user?.clinicId) {
      fetchPatients();
    }
  }, [user?.clinicId]);

  const fetchPatients = async () => {
    if (!user?.clinicId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('clinic_id', user.clinicId) // FILTRO CLAVE
        .neq('status', 'trash') // Exclude trash
        .order('updated_at', { ascending: false });

      if (error) throw error;

      if (data) {
        // Mapeamos de vuelta: usamos el objeto 'data' JSONB que contiene todo
        const loadedPatients = data.map(row => ({
          ...row.data, // Recuperamos la estructura original
          // Aseguramos que el ID coincida por si acaso
          id: row.id
        }));
        setPatients(loadedPatients);
      }
    } catch (error) {
      console.error("Error al cargar pacientes:", error);
      alert("Error al sincronizar con la nube. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  // --- TRIAJE LOGIC (DB INTEGRATED) ---
  const [dailyList, setDailyList] = useState([]);
  const [trashedAppointments, setTrashedAppointments] = useState([]);
  const [listDate, setListDate] = useState(getNowDate().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(getNowDate().split('T')[0]);

  // Real-time Subscription & Polling for Daily Appointments
  useEffect(() => {
    if (!user?.clinicId) return;

    // 1. Initial Fetch
    fetchDailyAppointments();

    // 2. Real-time Subscription
    const subscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `clinic_id=eq.${user.clinicId}` }, (payload) => {
        console.log('Real-time change detected:', payload);
        fetchDailyAppointments();
      })
      .subscribe();

    // 3. Polling (Backup every 5 minutes)
    const intervalId = setInterval(() => {
      console.log('Auto-refreshing appointments (5 min)...');
      fetchDailyAppointments();
    }, 5 * 60 * 1000);

    return () => {
      subscription.unsubscribe();
      clearInterval(intervalId);
    };
  }, [user?.clinicId, selectedDate]); // Re-subscribe if clinic or date changes

  const fetchDailyAppointments = async () => {
    if (!user.clinicId) return;
    try {
      // Use selectedDate instead of always today
      const dateToQuery = selectedDate;

      // Calculate start and end of day in UTC
      const startOfDay = new Date(`${dateToQuery}T00:00:00`);
      const endOfDay = new Date(`${dateToQuery}T23:59:59.999`);

      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', user.clinicId)
        .eq('status', 'confirmed') // Only show confirmed appointments
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString())
        .order('appointment_date', { ascending: true }) // Sort by time automatically
        .order('queue_order', { ascending: true });

      if (error) throw error;
      setDailyList(data || []);
      // Format date for display
      const [y, m, d] = dateToQuery.split('-');
      setListDate(`${d}/${m}/${y}`);
    } catch (error) {
      console.error("Error fetching daily list:", error);
    }
  };

  // Fetch trashed appointments
  const fetchTrashedAppointments = async () => {
    if (!user.clinicId) return;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('clinic_id', user.clinicId)
        .eq('status', 'trash')
        .order('deleted_at', { ascending: false, nullsFirst: false });

      if (error) throw error;
      setTrashedAppointments(data || []);
    } catch (error) {
      console.error("Error fetching trashed appointments:", error);
    }
  };

  // Restore appointment from trash
  const restoreAppointment = async (id) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'pending' })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTrashedAppointments(prev => prev.filter(a => a.id !== id));
      fetchAppointments(); // Refresh appointments list
    } catch (error) {
      console.error("Error restoring appointment:", error);
      alert("Error al restaurar la cita.");
    }
  };

  // Permanently delete appointment
  const permanentDeleteAppointment = async (id) => {
    if (!confirm("¿Estás seguro de eliminar permanentemente esta cita? Esta acción no se puede deshacer.")) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setTrashedAppointments(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error("Error permanently deleting appointment:", error);
      alert("Error al eliminar la cita.");
    }
  };


  // Re-fetch when selectedDate changes
  useEffect(() => {
    if (view === 'triage') {
      fetchDailyAppointments();
    }
  }, [selectedDate]);

  useEffect(() => {
    if (view === 'triage') {
      fetchDailyAppointments();
    }
    if (view === 'trash') {
      fetchTrashedAppointments();
    }
  }, [view]);

  const updateTriageStatus = async (id, status) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ triage_status: status })
        .eq('id', id);

      if (error) throw error;
      fetchDailyAppointments(); // Refresh list
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const updateAppointmentField = async (id, field, value) => {
    // Optimistic update
    setDailyList(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error updating ${field}:`, error);
      fetchDailyAppointments(); // Revert on error
    }
  };

  const handleMoveOrder = async (id, direction) => {
    const currentIndex = dailyList.findIndex(p => p.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= dailyList.length) return;

    // Swap in local state for immediate feedback
    const newList = [...dailyList];
    const item = newList[currentIndex];
    newList.splice(currentIndex, 1);
    newList.splice(newIndex, 0, item);
    setDailyList(newList);

    // Update DB (simple approach: update all orders)
    // In a real app with huge lists, this should be optimized.
    try {
      const updates = newList.map((p, idx) => ({
        id: p.id,
        queue_order: idx
      }));

      const { error } = await supabase
        .from('appointments')
        .upsert(updates.map(u => ({ id: u.id, queue_order: u.queue_order })));
      if (error) throw error;
    } catch (error) {
      console.error("Error reordering:", error);
      fetchDailyAppointments(); // Revert
    }
  };

  const [editingAppointment, setEditingAppointment] = useState(null); // { id, date, time }

  const handleSaveTime = async () => {
    if (!editingAppointment) return;

    // Combine date and time and convert to ISO (UTC)
    const localDate = new Date(`${editingAppointment.date}T${editingAppointment.time}:00`);
    const newDateTime = localDate.toISOString();

    // Find the original appointment to check status
    const originalApt = dailyList.find(p => p.id === editingAppointment.id) || appointments.find(a => a.id === editingAppointment.id);

    // IF APPOINTMENT WAS ALREADY ATTENDED, WE DUPLICATE IT INSTEAD OF MOVING IT
    if (originalApt && originalApt.triage_status === 'attended') {
      if (!confirm(`Este paciente ya fue atendido. ¿Desea crear una NUEVA CITA para el ${editingAppointment.date} a las ${editingAppointment.time}? (Se mantendrá el registro anterior como historial)`)) {
        return;
      }

      // Create NEW appointment
      // 1. Destructure to remove ID and other fields we don't want to copy directly
      const { id, created_at, ...rest } = originalApt;

      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([{
            ...rest,
            appointment_date: newDateTime,
            status: 'confirmed', // New appointment starts as confirmed
            triage_status: 'pending', // Reset triage
            payment_status: 'pending', // Reset payment
            created_at: new Date().toISOString(),
            queue_order: 999 // Put at end
          }])
          .select();

        if (error) throw error;

        alert("Nueva cita creada exitosamente.");
        setEditingAppointment(null);
        fetchDailyAppointments(); // Refresh lists
        fetchAppointments();
      } catch (error) {
        console.error("Error duplicating appointment:", error);
        alert("Error al crear nueva cita.");
      }
      return;
    }

    // NORMAL UPDATE (Move existing appointment)
    // Optimistic update for Daily List (Triage)
    setDailyList(prev => {
      // If the new date is different from the currently viewed date, remove it from the list
      if (editingAppointment.date !== selectedDate) {
        return prev.filter(p => p.id !== editingAppointment.id);
      }

      // Otherwise, update and re-sort
      const updatedList = prev.map(p => p.id === editingAppointment.id ? { ...p, appointment_date: newDateTime } : p);
      return updatedList.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    });

    // Optimistic update for Agenda
    setAppointments(prev => {
      const updatedList = prev.map(a => a.id === editingAppointment.id ? { ...a, appointment_date: newDateTime } : a);
      return updatedList.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
    });

    setEditingAppointment(null);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ appointment_date: newDateTime })
        .eq('id', editingAppointment.id);

      if (error) throw error;

      // Re-fetch to ensure consistency (optional but safer)
      // fetchDailyAppointments(); 
    } catch (error) {
      console.error("Error updating time:", error);
      fetchDailyAppointments(); // Revert
      fetchAppointments(); // Revert
    }
  };

  const deleteAppointment = async (id) => {
    const apt = appointments.find(a => a.id === id) || dailyList.find(a => a.id === id);

    if (!apt) return;

    // PROTECCIÓN ESTRICTA: No permitir borrar si está en Triaje
    const protectedStatuses = ['confirmed', 'arrived', 'attended'];
    if (protectedStatuses.includes(apt.status)) {
      alert("🚫 ACCIÓN BLOQUEADA\n\nNo se puede eliminar esta cita desde la Agenda porque ya se encuentra en Triaje (Confirmado, En Sala o Atendido).\n\nPara eliminarla, debe hacerlo desde la vista de Triaje o cambiar su estado.");
      return;
    }

    // PROTECCIÓN HISTÓRICA: No permitir borrar citas pasadas
    const today = new Date().toISOString().split('T')[0];
    const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];

    if (aptDate < today) {
      alert("🚫 ACCIÓN BLOQUEADA\n\nNo se puede eliminar esta cita porque pertenece al historial (fecha pasada).\n\nLas citas de días anteriores se conservan como registro histórico.");
      return;
    }

    if (!window.confirm("¿Estás seguro de que deseas eliminar esta solicitud?")) return;

    // Optimistic update
    setDailyList(prev => prev.filter(p => p.id !== id));
    setAppointments(prev => prev.filter(a => a.id !== id));

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'trash',
          deleted_at: new Date().toISOString(),
          deleted_from: view === 'agenda-v2' ? 'Agenda v2' : view === 'agenda' ? 'Agenda v1' : 'Desconocido'
        })
        .eq('id', id);

      if (error) throw error;

      // Refresh trash if in trash view
      if (view === 'trash') {
        fetchTrashedAppointments();
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      fetchDailyAppointments(); // Revert
      fetchAppointments(); // Revert
    }
  };

  const handleSelectAll = (e, visibleAppointments) => {
    if (e.target.checked) {
      setSelectedAppointments(visibleAppointments.map(a => a.id));
    } else {
      setSelectedAppointments([]);
    }
  };

  const handleSelectAppointment = (id) => {
    setSelectedAppointments(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedAppointments.length === 0) return;

    // PROTECCIÓN ESTRICTA GLOBAL (Agenda v1 y v2)
    const protectedStatuses = ['confirmed', 'arrived', 'attended'];
    const today = new Date().toISOString().split('T')[0];

    // Filtramos las citas que son seguras de borrar (NO están en Triaje Y NO son pasadas)
    const safeToDelete = appointments.filter(a => {
      if (!selectedAppointments.includes(a.id)) return false;

      const isTriage = protectedStatuses.includes(a.status);
      const isPast = new Date(a.appointment_date).toISOString().split('T')[0] < today;

      return !isTriage && !isPast;
    }).map(a => a.id);

    const skippedCount = selectedAppointments.length - safeToDelete.length;

    if (safeToDelete.length === 0) {
      alert("🚫 ACCIÓN BLOQUEADA\n\nTodas las citas seleccionadas están protegidas (Triaje o Historial) y no se pueden eliminar desde aquí.");
      return;
    }

    let warningMessage = "";
    if (skippedCount > 0) {
      warningMessage = `⚠️ ATENCIÓN: Se omitirán ${skippedCount} citas protegidas (Triaje o Historial).\n\n`;
    }

    if (!window.confirm(`${warningMessage}¿Estás seguro de eliminar las ${safeToDelete.length} solicitudes restantes?`)) return;

    const itemsToDelete = safeToDelete;

    // Optimistic Update
    setAppointments(prev => prev.filter(a => !itemsToDelete.includes(a.id)));
    setDailyList(prev => prev.filter(a => !itemsToDelete.includes(a.id)));
    setSelectedAppointments([]);

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'trash',
          deleted_at: new Date().toISOString(),
          deleted_from: view === 'agenda-v2' ? 'Agenda v2' : view === 'agenda' ? 'Agenda v1' : 'Desconocido'
        })
        .in('id', itemsToDelete);

      if (error) throw error;

      // Refresh trash if in trash view
      if (view === 'trash') {
        fetchTrashedAppointments();
      }
    } catch (error) {
      console.error("Error bulk deleting:", error);
      fetchAppointments();
      fetchDailyAppointments();
    }
  };

  const handleTriageBulkDelete = async () => {
    if (selectedTriageItems.length === 0) return;
    if (!window.confirm(`¿Estás seguro de eliminar ${selectedTriageItems.length} pacientes de la lista de triaje? Esta acción moverá las citas a la papelera.`)) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status: 'trash',
          deleted_at: new Date().toISOString(),
          deleted_from: 'Triaje'
        })
        .in('id', selectedTriageItems);

      if (error) throw error;

      alert("Pacientes eliminados correctamente.");
      setSelectedTriageItems([]);
      fetchAppointments();
      fetchDailyAppointments();
    } catch (error) {
      console.error("Error deleting triage items:", error);
      alert("Error al eliminar pacientes.");
    }
  };

  const handleTriageSelectAll = (e, items) => {
    if (e.target.checked) {
      setSelectedTriageItems(items.map(i => i.id));
    } else {
      setSelectedTriageItems([]);
    }
  };

  const deletePatient = async (patient) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar al paciente ${patient.nombre}? Se moverá a la papelera.`)) return;

    // Optimistic update
    setPatients(prev => prev.filter(p => p.id !== patient.id));

    try {
      const { error } = await supabase
        .from('patients')
        .update({ status: 'trash' }) // Soft delete
        .eq('id', patient.id);

      if (error) throw error;
    } catch (error) {
      console.error("Error deleting patient:", error);
      fetchPatients(); // Revert
      alert("Error al eliminar paciente.");
    }
  };

  const [formData, setFormData] = useState({
    id: '', nombre: '', edad: '', sexo: 'Mujer', ocupacion: '', procedencia: '',
    celular: '', email: '', fechaNacimiento: '', fur: '', // Added fur
    referencia: '', enfermedades: '', medicamentos: '', alergias: '', cirugias: '',
    fechaCita: getNowDate(), resumen: '',
    examenOido: '', examenNariz: '', examenGarganta: '',
    diagnosticos: [],
    receta: [],
    indicaciones: ''
  });

  const parseDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split(/[-/]/);
    if (parts.length === 3) {
      if (parseInt(parts[0]) > 1900) return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
    return '';
  };

  const handleImport = (e) => {
    const text = e.target.value;
    setImportText(text);
    if (!text) return;
    const columns = text.split('\t');
    if (columns.length > 5) {
      setFormData(prev => ({
        ...prev,
        fechaCita: columns[2] ? columns[2].replace(' ', 'T') : getNowDate(),
        resumen: columns[3] || '',
        id: columns[4] || '',
        nombre: columns[5] || '',
        edad: columns[6] || '',
        sexo: columns[7] || 'Mujer',
        ocupacion: columns[8] || '',
        procedencia: columns[9] || '',
        celular: columns[10] || '',
        email: columns[11] || '',
        fechaNacimiento: parseDate(columns[12]),
        enfermedades: columns[13] || '',
        medicamentos: columns[14] || '',
        alergias: columns[15] || '',
        cirugias: columns[16] || '',
        referencia: (columns[17] || '') + (columns[18] ? ` (${columns[18]})` : '')
      }));
    }
  };

  const getFilteredVademecum = () => {
    if (!formData.diagnosticos || formData.diagnosticos.length === 0) {
      return Object.values(VADEMECUM_TABULAR).flat();
    }

    const relevantCategories = new Set();
    formData.diagnosticos.forEach(d => {
      // Mapeo simple de palabras clave a categorías del Vademécum
      const desc = d.desc.toUpperCase();
      if (desc.includes("RINITIS") || desc.includes("SINUSITIS") || desc.includes("NASAL") || desc.includes("EPISTAXIS") || desc.includes("CORNETES")) {
        relevantCategories.add("NARIZ");
      }
      if (desc.includes("OTITIS") || desc.includes("OÍDO") || desc.includes("CERUMEN") || desc.includes("TINNITUS") || desc.includes("VÉRTIGO") || desc.includes("MENIERE")) {
        relevantCategories.add("OÍDO");
      }
      if (desc.includes("FARINGITIS") || desc.includes("AMIGDALITIS") || desc.includes("GARGANTA") || desc.includes("DISFONÍA") || desc.includes("REFLUJO")) {
        relevantCategories.add("LARINGE");
      }
      if (desc.includes("PEDIATRÍA") || desc.includes("NIÑO") || desc.includes("ADENOIDES")) {
        relevantCategories.add("NIÑOS");
      }
    });

    if (relevantCategories.size === 0) return Object.values(VADEMECUM_TABULAR).flat();

    let meds = [];
    relevantCategories.forEach(cat => {
      if (VADEMECUM_TABULAR[cat]) {
        meds = [...meds, ...VADEMECUM_TABULAR[cat]];
      }
    });
    return meds;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addExamTemplate = (field, text) => {
    setFormData(prev => ({ ...prev, [field]: prev[field] ? prev[field] + " " + text : text }));
  };

  const addMedicationRow = (medObj) => {
    setFormData(prev => ({
      ...prev,
      receta: [...prev.receta, { ...medObj, id: Date.now() }]
    }));
  };

  const updateMedicationRow = (index, field, val) => {
    const newReceta = [...formData.receta];
    newReceta[index][field] = val;
    setFormData(prev => ({ ...prev, receta: newReceta }));
  };

  const removeMedicationRow = (index) => {
    setFormData(prev => ({ ...prev, receta: prev.receta.filter((_, i) => i !== index) }));
  };

  const addManualDiagnosis = () => {
    if (diagInput.desc) {
      setFormData(prev => ({
        ...prev,
        diagnosticos: [...prev.diagnosticos, { code: diagInput.code, desc: diagInput.desc }]
      }));
      setDiagInput({ code: '', desc: '' });
    }
  };

  const selectCommonDiagnosis = (e) => {
    const label = e.target.value;
    if (!label) return;
    let found = null;
    // Buscar en categorías
    Object.values(DIAGNOSTICOS_COMUNES).forEach(items => {
      const item = items.find(d => d.label === label);
      if (item) found = item;
    });

    if (found) {
      setFormData(prev => ({
        ...prev,
        diagnosticos: [...prev.diagnosticos, { code: found.cie10, desc: found.label }]
      }));
    }
    e.target.value = "";
  };

  const selectProtocol = (e) => {
    const selectedLabel = e.target.value;
    if (!selectedLabel) return;
    let protocol = null;
    Object.values(CATALOGO_MEDICO).forEach(categoria => {
      const found = categoria.find(p => p.label === selectedLabel);
      if (found) protocol = found;
    });
    if (protocol) {
      const newDiags = [{ code: protocol.cie10, desc: protocol.label }];
      if (protocol.extraDiags) {
        newDiags.push(...protocol.extraDiags);
      }
      setFormData(prev => ({
        ...prev,
        diagnosticos: [...prev.diagnosticos, ...newDiags],
        indicaciones: prev.indicaciones + (prev.indicaciones ? "\n\n" : "") + (protocol.indic || ""),
        receta: [...prev.receta, ...(protocol.trat || []).map(t => ({ ...t, id: Date.now() + Math.random() }))]
      }));
    }
    e.target.value = "";
  };

  const removeDiagnosis = (index) => {
    setFormData(prev => ({ ...prev, diagnosticos: prev.diagnosticos.filter((_, i) => i !== index) }));
  };

  const prepareFormForNewConsultation = (patient) => {
    setIsNewPatient(false);
    setEditingConsultationIndex(null); // Resetear edición
    setFormData({
      id: patient.id, nombre: patient.nombre, edad: patient.edad, sexo: patient.sexo,
      ocupacion: patient.ocupacion || '', procedencia: patient.procedencia || '',
      celular: patient.celular, email: patient.email || '', fechaNacimiento: patient.fechaNacimiento || '',
      referencia: patient.referencia || '', enfermedades: patient.enfermedades || '',
      medicamentos: patient.medicamentos || '', alergias: patient.alergias || '', cirugias: patient.cirugias || '',
      fechaCita: getNowDate(), resumen: '',
      examenOido: '', examenNariz: '', examenGarganta: '',
      diagnosticos: [],
      receta: [],
      indicaciones: ''
    });
    navigate('form');
  };

  // --- GUARDADO EN NUBE (SUPABASE) ---
  const onFormSubmit = async (e) => {
    e.preventDefault();
    await saveConsultation();
  };

  const saveConsultation = async () => {
    const docId = formData.id || Date.now().toString();
    const currentConsultationData = {
      fechaCita: formData.fechaCita,
      resumen: formData.resumen,
      examenOido: formData.examenOido,
      examenNariz: formData.examenNariz,
      examenGarganta: formData.examenGarganta,
      diagnosticos: formData.diagnosticos,
      receta: formData.receta,
      indicaciones: formData.indicaciones,
      atendidoPor: user.username || 'Desconocido' // Guardar quién atendió
    };

    // 1. Construir el objeto paciente actualizado
    let patientToSave;
    let updatedPatientsList;

    if (isNewPatient) {
      patientToSave = { ...formData, consultas: [currentConsultationData] };
      updatedPatientsList = [patientToSave, ...patients];
    } else {
      // Buscar y actualizar en la lista local primero (optimistic update)
      updatedPatientsList = patients.map(p => {
        if (p.id === docId) {
          const previousConsultations = p.consultas || [];
          let newConsultations;

          if (editingConsultationIndex !== null) {
            newConsultations = [...previousConsultations];
            newConsultations[editingConsultationIndex] = currentConsultationData;
          } else {
            newConsultations = [currentConsultationData, ...previousConsultations];
          }
          patientToSave = { ...formData, consultas: newConsultations };
          return patientToSave;
        }
        return p;
      });
    }

    // 2. Actualizar estado local
    setPatients(updatedPatientsList);

    // ACTUALIZAR selectedPatient SI ES EL MISMO QUE ESTAMOS EDITANDO
    if (selectedPatient && selectedPatient.id === docId) {
      setSelectedPatient(patientToSave);
    }

    // setView('list'); // MOVIDO AL FINAL para permitir imprimir
    setImportText('');
    setEditingConsultationIndex(null);

    // 3. Guardar en Supabase
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (!authUser) {
        alert("No estás autenticado. No se pudo guardar en la nube.");
        return;
      }

      // Validar que tengamos clinic_id (si es modo SaaS)
      // Si es legacy (user.clinicId es null), permitimos guardar (pero RLS podría fallar si no hay políticas para null)
      // Asumimos que si hay clinicId, lo usamos.

      const payload = {
        id: patientToSave.id,
        nombre: patientToSave.nombre,
        edad: patientToSave.edad,
        sexo: patientToSave.sexo,
        celular: patientToSave.celular,
        email: patientToSave.email,
        data: patientToSave,
        user_id: authUser.id,
        updated_at: new Date().toISOString()
      };

      if (user.clinicId) {
        payload.clinic_id = user.clinicId;
      }

      const { error } = await supabase
        .from('patients')
        .upsert(payload);

      if (error) throw error;
      // Opcional: mostrar toast de éxito
      setIsPrescriptionOpen(false); // Close modal if open

      // Preguntar si desea imprimir DESPUÉS de guardar
      if (formData.receta.length > 0) {
        if (confirm("Consulta guardada correctamente. ¿Desea imprimir la receta ahora?")) {
          // Necesitamos establecer el paciente seleccionado para que el modal funcione
          setSelectedPatient(patientToSave);
          // Y la consulta seleccionada (la última, que acabamos de agregar)
          if (patientToSave.consultas && patientToSave.consultas.length > 0) {
            // Si es nuevo o editado, suele ser la primera en la lista si ordenamos por fecha, 
            // pero en el array 'consultas' que acabamos de guardar:
            // Si es nuevo: consultas[0]
            // Si editamos: consultas[editingIndex]
            // Para simplificar, usamos la lógica de visualización que usa 'getDisplayConsultation'
            // pero necesitamos asegurarnos que 'selectedConsultationIndex' apunte a la correcta.

            // Si es nuevo paciente o nueva consulta, la agregamos al inicio en 'updatedPatientsList' logic?
            // Revisemos save logic:
            // if (isNewPatient) ... consultas: [current] ...
            // else ... newConsultations = [current, ...prev] OR update index

            if (editingConsultationIndex !== null) {
              setSelectedConsultationIndex(editingConsultationIndex);
            } else {
              setSelectedConsultationIndex(0); // La más reciente
            }
          }
          setIsPrescriptionOpen(true);
          // No cambiamos a 'list' todavía para permitir imprimir
          return;
        }
      }

      // Si no imprime, volvemos a la lista
      navigate('list');

    } catch (error) {
      console.error("Error al guardar en Supabase:", error);
      alert("Error al guardar en la nube. Los datos están en local pero podrían perderse si recargas.");
    }
  };

  const filteredPatients = patients.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm)
  );

  // Cargar datos al abrir modal receta
  useEffect(() => {
    if (isPrescriptionOpen) {
      const consultation = getDisplayConsultation();
      // FIX: Si la consulta viene vacía (ej. acabamos de guardar y el estado no se ha refrescado completamente)
      // o si estamos en el flujo de "Guardar y luego Imprimir", usamos formData como fallback
      const recetaData = (consultation && consultation.receta && consultation.receta.length > 0)
        ? consultation.receta
        : (formData.receta || []);

      setEditableReceta(recetaData);
      setEditableIndicaciones(consultation.indicaciones || "");
    }
  }, [isPrescriptionOpen, selectedPatient, selectedConsultationIndex, formData.receta]);

  const openPrescriptionModal = () => {
    const consultation = getDisplayConsultation();
    setEditableReceta(JSON.parse(JSON.stringify(consultation.receta || [])));
    setEditableIndicaciones(consultation.indicaciones || "");
    setIsPrescriptionOpen(true);
  };

  const handleUpdatePrescription = () => {
    if (!selectedPatient) return;
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        // Clonar para mutar
        const pClone = JSON.parse(JSON.stringify(p));
        if (pClone.consultas && pClone.consultas[selectedConsultationIndex]) {
          pClone.consultas[selectedConsultationIndex].receta = editableReceta;
          pClone.consultas[selectedConsultationIndex].indicaciones = editableIndicaciones;
        }
        // Actualizar también el paciente seleccionado para que la UI reaccione
        setSelectedPatient(pClone);
        return pClone;
      }
      return p;
    });
    setPatients(updatedPatients);
    // alert("Receta actualizada correctamente (Local)");
  };

  const printPrescription = () => {
    window.print();
  };

  const exportToCSV = () => {
    const headers = ["ID", "Nombre", "Edad", "Celular", "Fecha Última Cita", "Diagnósticos"];
    const rows = patients.map(p => {
      const lastConsult = p.consultas && p.consultas.length > 0 ? p.consultas[0] : p;
      return [
        p.id, `"${p.nombre}"`, p.edad, p.celular,
        lastConsult.fechaCita,
        `"${(lastConsult.diagnosticos || []).map(d => d.desc).join(', ')}"`
      ];
    });
    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pacientes_demo.csv`);
    link.click();
  };

  const exportToJSON = () => {
    const jsonString = JSON.stringify(patients, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_pacientes_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
  };



  const handleBulkPaste = () => {
    if (!pasteText.trim()) return;

    const rows = pasteText.trim().split('\n');
    if (rows.length < 2) {
      alert("Por favor pegue al menos una fila de encabezados y una fila de datos.");
      return;
    }

    const headers = rows[0].split('\t').map(h => h.trim());
    const dataRows = rows.slice(1);

    if (window.confirm(`Se detectaron ${dataRows.length} filas. ¿Procesar importación?`)) {
      const newPatients = dataRows.map(rowStr => {
        const rowVals = rowStr.split('\t');
        const rowObj = {};
        headers.forEach((h, i) => {
          rowObj[h] = rowVals[i]?.trim();
        });

        // Función auxiliar para buscar valor insensible a mayúsculas
        const getVal = (keys) => {
          for (const k of keys) {
            // Buscamos coincidencia exacta en el objeto fila construido
            const keyLower = k.toLowerCase();
            const foundKey = Object.keys(rowObj).find(rk => rk.toLowerCase() === keyLower);
            if (foundKey && rowObj[foundKey]) return rowObj[foundKey];
          }
          return '';
        };

        return {
          id: String(getVal(['Documento de Identidad', 'DNI', 'ID', 'Documento']) || Date.now() + Math.random()),
          nombre: getVal(['Nombre y Apellido', 'Nombre', 'Paciente', 'Nombres', 'Apellidos']) || 'Sin Nombre',
          edad: getVal(['Edad', 'Años']) || '',
          sexo: getVal(['Sexo', 'Género']) || 'Mujer',
          ocupacion: getVal(['Ocupacion', 'Ocupación']) || '',
          procedencia: getVal(['Procedencia (Distrito)', 'Procedencia', 'Direccion', 'Dirección']) || '',
          celular: String(getVal(['Celular Whatsapp', 'Celular', 'Telefono', 'Teléfono', 'Movil']) || ''),
          email: getVal(['Email', 'Correo']) || '',
          fechaNacimiento: parseDate(String(getVal(['Fecha de Nacimiento', 'Fecha Nacimiento', 'Nacimiento']) || '')),
          fechaCita: getVal(['Fecha y Hora de la cita', 'Marca temporal']) || getNowDate(),
          resumen: getVal(['Resumen de enfermedad', 'Motivo']) || '',
          enfermedades: getVal(['Enfermedad', 'Enfermedades', 'Antecedentes']) || '',
          medicamentos: getVal(['Medicamentos usados frecuentemente', 'Medicamentos']) || '',
          alergias: getVal(['Alergias a medicamentos', 'Alergias']) || '',
          cirugias: getVal(['Cirugias en Cabeza y/o cuello?', 'Cirugias']) || '',
          referencia: (getVal(['¿Como nos encontró?', 'Referencia']) || '') + ' ' + (getVal(['Si fue recomendado por otro medico o paciente atendido previamente podria escribir su nombre']) || ''),
          examenOido: '', examenNariz: '', examenGarganta: '',
          diagnosticos: [],
          receta: [],
          indicaciones: '',
          consultas: []
        };
      });

      setPatients(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPatients = newPatients.filter(p => !existingIds.has(p.id));
        return [...uniqueNewPatients, ...prev];
      });

      alert(`Importación completada: ${newPatients.length} registros procesados.`);
      setIsPasteModalOpen(false);
      setPasteText("");
    }
  };






  // --- LÓGICA DE GESTIÓN DE DATOS ---

  const handlePreviewExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Array of arrays

        if (jsonData.length < 2) {
          alert("El archivo parece vacío o sin encabezados.");
          return;
        }

        const headers = jsonData[0];
        const rows = jsonData.slice(1, 6); // Preview first 5 rows

        // Guardamos todo el contenido raw para procesarlo luego
        setImportPreview({
          headers,
          previewRows: rows,
          fullData: XLSX.utils.sheet_to_json(worksheet),
          fileName: file.name
        });
      } catch (error) {
        console.error(error);
        alert("Error al leer el archivo Excel.");
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const processImport = () => {
    if (!importPreview || !importPreview.fullData) return;

    const newPatients = importPreview.fullData.map(row => {
      // Mapeo flexible (reutilizando lógica anterior)
      const getVal = (keys) => {
        for (const k of keys) {
          if (row[k] !== undefined) return row[k];
          const keyLower = k.toLowerCase();
          const foundKey = Object.keys(row).find(rk => rk.toLowerCase() === keyLower);
          if (foundKey) return row[foundKey];
        }
        return '';
      };

      return {
        id: String(getVal(['Documento de Identidad', 'DNI', 'ID', 'Documento']) || Date.now() + Math.random()),
        nombre: getVal(['Nombre y Apellido', 'Nombre', 'Paciente', 'Nombres', 'Apellidos']) || 'Sin Nombre',
        edad: getVal(['Edad', 'Años']) || '',
        sexo: getVal(['Sexo', 'Género']) || 'Mujer',
        ocupacion: getVal(['Ocupacion', 'Ocupación']) || '',
        procedencia: getVal(['Procedencia (Distrito)', 'Procedencia', 'Direccion', 'Dirección']) || '',
        celular: String(getVal(['Celular Whatsapp', 'Celular', 'Telefono', 'Teléfono', 'Movil']) || ''),
        email: getVal(['Email', 'Correo']) || '',
        fechaNacimiento: parseDate(String(getVal(['Fecha de Nacimiento', 'Fecha Nacimiento', 'Nacimiento']) || '')),
        fechaCita: getVal(['Fecha y Hora de la cita', 'Marca temporal']) || getNowDate(),
        resumen: getVal(['Resumen de enfermedad', 'Motivo']) || '',
        enfermedades: getVal(['Enfermedad', 'Enfermedades', 'Antecedentes']) || '',
        medicamentos: getVal(['Medicamentos usados frecuentemente', 'Medicamentos']) || '',
        alergias: getVal(['Alergias a medicamentos', 'Alergias']) || '',
        cirugias: getVal(['Cirugias en Cabeza y/o cuello?', 'Cirugias']) || '',
        referencia: (getVal(['¿Como nos encontró?', 'Referencia']) || '') + ' ' + (getVal(['Si fue recomendado por otro medico o paciente atendido previamente podria escribir su nombre']) || ''),
        examenOido: '', examenNariz: '', examenGarganta: '',
        diagnosticos: [],
        receta: [],
        indicaciones: '',
        consultas: []
      };
    });

    if (importMode === 'replace') {
      if (window.confirm(`ADVERTENCIA: Se eliminarán todos los pacientes actuales y se reemplazarán por los ${newPatients.length} del archivo. ¿Continuar?`)) {
        setPatients(newPatients);
        alert("Base de datos reemplazada exitosamente.");
        setImportPreview(null);
        setIsDataModalOpen(false);
      }
    } else {
      // MERGE
      setPatients(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const uniqueNewPatients = newPatients.filter(p => !existingIds.has(p.id));
        return [...uniqueNewPatients, ...prev];
      });
      alert("Importación completada (Modo Fusión).");
      setImportPreview(null);
      setIsDataModalOpen(false);
    }
  };

  const handleRestoreBackupFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (!Array.isArray(json)) {
          alert("El archivo no es válido (debe ser una lista de pacientes).");
          return;
        }

        if (importMode === 'replace') {
          if (window.confirm(`ADVERTENCIA: Se eliminarán todos los datos actuales. ¿Restaurar backup con ${json.length} pacientes?`)) {
            setPatients(json);
            alert("Restauración completa.");
            setIsDataModalOpen(false);
          }
        } else {
          // MERGE JSON
          setPatients(prev => {
            const existingIds = new Set(prev.map(p => p.id));
            const newItems = json.filter(p => !existingIds.has(p.id));
            return [...newItems, ...prev];
          });
          alert("Backup fusionado correctamente.");
          setIsDataModalOpen(false);
        }
      } catch (err) {
        alert("Error al leer el archivo JSON.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getDisplayConsultation = () => {
    if (!selectedPatient || !selectedPatient.consultas) return selectedPatient;
    return selectedPatient.consultas[selectedConsultationIndex] || selectedPatient;
  };

  const handleEditConsultation = () => {
    if (!selectedPatient) return;
    const consultation = getDisplayConsultation();

    setFormData({
      id: selectedPatient.id,
      nombre: selectedPatient.nombre,
      edad: selectedPatient.edad,
      sexo: selectedPatient.sexo,
      ocupacion: selectedPatient.ocupacion || '',
      procedencia: selectedPatient.procedencia || '',
      celular: selectedPatient.celular,
      email: selectedPatient.email || '',
      fechaNacimiento: selectedPatient.fechaNacimiento || '',
      referencia: selectedPatient.referencia || '',
      enfermedades: selectedPatient.enfermedades || '',
      medicamentos: selectedPatient.medicamentos || '',
      alergias: selectedPatient.alergias || '',
      cirugias: selectedPatient.cirugias || '',

      // Datos de la consulta específica
      fechaCita: consultation.fechaCita,
      resumen: consultation.resumen,
      examenOido: consultation.examenOido || '',
      examenNariz: consultation.examenNariz || '',
      examenGarganta: consultation.examenGarganta || '',
      diagnosticos: consultation.diagnosticos || [],
      receta: consultation.receta || [],
      indicaciones: consultation.indicaciones || ''
    });

    setIsNewPatient(false);
    setEditingConsultationIndex(selectedConsultationIndex);
    navigate('form');
  };

  // Renderizado de la tabla de receta (MODO LECTURA / IMPRESIÓN)
  const renderRecetaTable = (recetaItems) => {
    if (!recetaItems || recetaItems.length === 0) return <p className="text-gray-400 italic text-xs">Sin receta.</p>;
    return (
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="border-b-2 border-black">
            <th className="text-left py-1 font-bold text-black w-[40%]">MEDICAMENTO</th>
            <th className="text-center py-1 font-bold text-black w-[10%]">#</th>
            <th className="text-left py-1 font-bold text-black w-[35%]">INDICACIONES</th>
            <th className="text-center py-1 font-bold text-black w-[5%]">VÍA</th>
            <th className="text-center py-1 font-bold text-black w-[10%]">DÍAS</th>
          </tr>
        </thead>
        <tbody>
          {recetaItems.map((item, idx) => (
            <tr key={idx} className="border-b border-gray-300">
              <td className="py-2 pr-2 font-bold text-gray-900 align-top">{item.med}</td>
              <td className="py-2 text-center text-gray-800 align-top">{item.cant}</td>
              <td className="py-2 px-2 text-gray-800 align-top">{item.ind}</td>
              <td className="py-2 text-center text-gray-800 align-top">{item.via}</td>
              <td className="py-2 text-center text-gray-800 align-top">{item.dur}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-slate-800">
      <style>{`
@media print {
body * { visibility: hidden; }
#printable-area, #printable-area * { visibility: visible; }
#printable-area {
position: fixed;
left: 0;
top: 0;
width: 100%;
height: 100%;
margin: 0;
padding: 0;
background: white;
z-index: 9999;
display: block !important;
}
/* Eliminar bordes de inputs al imprimir */
#printable-area input, #printable-area textarea {
border: none;
background: transparent;
resize: none;
font-family: inherit;
font-size: inherit;
color: black;
width: 100%;
padding: 0;
margin: 0;
}
@page { size: A5 landscape; margin: 0; }
.no-print { display: none !important; }
}
`}</style>

      {/* OVERLAY MÓVIL (Fondo oscuro cuando el menú está abierto) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Navegación) */}
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
              <p className="text-sm text-blue-100 font-medium">¡Hola, {user.user?.user_metadata?.full_name?.split(' ')[0] || 'Doctor'}!</p>
              <p className="text-xs text-slate-400 break-words">{user.user?.email}</p>
            </div>
          </div>
          {/* Botón cerrar en móvil */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">



          <button onClick={() => { navigate('list'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Users className="w-5 h-5 mr-3" />
            <span className="font-medium">Pacientes</span>
          </button>

          <button onClick={() => { navigate('triage'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'triage' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
            <Clipboard className="w-5 h-5 mr-3" />
            <span className="font-medium">Triaje / Lista</span>
          </button>

          {(user.role === 'doctor' || user.role === 'admin') && (
            <button onClick={() => {
              setIsNewPatient(true);
              setEditingConsultationIndex(null);
              setFormData({
                id: '', nombre: '', edad: '', sexo: 'Mujer', ocupacion: '', procedencia: '',
                celular: '', email: '', fechaNacimiento: '',
                referencia: '', enfermedades: '', medicamentos: '', alergias: '', cirugias: '',
                fechaCita: getNowDate(), resumen: '',
                examenOido: '', examenNariz: '', examenGarganta: '',
                diagnosticos: [],
                receta: [],
                indicaciones: ''
              });
              navigate('form');
              setIsMobileMenuOpen(false);
            }} className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'form' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 hover:text-blue-300 border border-blue-900/50'}`}>
              <UserPlus className="w-5 h-5 mr-3" />
              <span className="font-medium">Nuevo Paciente</span>
            </button>
          )}

          <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
            <button
              onClick={() => { setView('agenda'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'agenda' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <CalendarDays className="w-5 h-5 mr-3" />
              <span className="font-medium">Solicitud de Citas</span>
            </button>

            <button
              onClick={() => { setView('agenda-v2'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'agenda-v2' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="relative mr-3">
                <CalendarDays className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
              </div>
              <span className="font-medium">Agenda v2.0</span>
            </button>

            <button
              onClick={() => { setView('trash'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center p-3 rounded-lg transition-all ${view === 'trash' ? 'bg-red-600 text-white shadow-lg shadow-red-900/50' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
            >
              <Trash2 className="w-5 h-5 mr-3" />
              <span className="font-medium">Papelera</span>
            </button>

            {(user.role === 'admin') && (
              <button onClick={() => setIsTeamModalOpen(true)} className="w-full flex items-center p-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-all">
                <UserPlus className="w-5 h-5 mr-3" />
                <span className="font-medium text-sm">Gestionar Equipo</span>
              </button>
            )}
            <button onClick={() => setIsDataModalOpen(true)} className="w-full flex items-center p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-all">
              <Briefcase className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm">Gestión de Datos</span>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 w-full p-4 bg-slate-900 border-t border-slate-800">
          <button onClick={onLogout} className="flex items-center text-slate-400 hover:text-red-400 transition-colors text-sm font-medium w-full mb-3">
            <LogOut className="w-5 h-5 mr-3" />
            Cerrar Sesión
          </button>
          <div className="text-center">
            <span className="text-[10px] text-slate-600 font-medium">v10.0.1 (Stable)</span>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 h-screen overflow-y-auto bg-slate-50 relative w-full">
        {/* HEADER MÓVIL */}
        <div className="md:hidden bg-white border-b p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsMobileMenuOpen(true)} className="text-slate-600 hover:text-blue-600">
              <ListPlus className="w-6 h-6" />
            </button>
            <span className="font-bold text-slate-800">
              {view === 'list' && 'Pacientes'}
              {view === 'triage' && 'Triaje'}
              {view === 'agenda' && 'Solicitud Citas'}
              {view === 'agenda-v2' && 'Agenda v2.0'}
              {view === 'form' && 'Ficha de Ingreso'}
              {view === 'detail' && 'Historia Clínica'}
            </span>
          </div>
          <div className="w-8"></div> {/* Espaciador para centrar */}

        </div>

        <div className="p-4 md:p-8 pb-24">
          <header className="bg-white shadow-sm p-4 md:p-6 sticky top-0 z-10 flex justify-between items-center no-print">
            <h1 className="text-2xl font-bold text-gray-800">
              {view === 'list' && 'Base de Datos de Pacientes'}
              {view === 'form' && (isNewPatient ? 'Ficha de Ingreso' : (editingConsultationIndex !== null ? 'Editar Consulta' : 'Nueva Consulta Médica'))}
              {view === 'detail' && 'Historia Clínica Digital'}
              {view === 'triage' && 'Triaje y Lista de Espera'}
            </h1>
          </header>

        </div>

        <div className="p-4 md:p-8">
          {/* VISTA LISTA */}
          {view === 'list' && (
            <div className="space-y-6">
              <div className="flex gap-4 items-center justify-between flex-wrap">
                <div className="relative max-w-xl flex-1 min-w-[300px]">
                  <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                  <input type="text" placeholder="Buscar por nombre o DNI..." className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2 no-print">
                  <button onClick={() => setIsDataModalOpen(true)} className="flex items-center bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 shadow transition-all transform hover:scale-105">
                    <Briefcase className="w-4 h-4 mr-2" /> Gestionar Datos / Backup
                  </button>
                  <button onClick={exportToCSV} className="flex items-center bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 shadow transition-all transform hover:scale-105">
                    <FileText className="w-4 h-4 mr-2" /> Reporte Excel (CSV)
                  </button>
                </div>

              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
                    <tr><th className="p-4">Paciente</th><th className="p-4">Última Cita</th><th className="p-4">Acción</th></tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p, idx) => {
                      const lastDate = p.consultas && p.consultas.length > 0 ? p.consultas[0].fechaCita : p.fechaCita;
                      return (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="p-4 font-medium">{p.nombre} <br /><span className="text-xs text-gray-500">DNI: {p.id}</span></td>
                          <td className="p-4 text-sm">{new Date(lastDate).toLocaleDateString()} <span className="text-gray-400 text-xs">{new Date(lastDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></td>
                          <td className="p-4">
                            {(user.role === 'doctor' || user.role === 'admin') && (
                              <div className="flex items-center gap-2">
                                <button onClick={() => { setSelectedPatient(p); setSelectedConsultationIndex(0); navigate('detail', { patientId: p.id }); }} className="text-teal-600 hover:underline text-sm font-bold">Ver Historia</button>
                                <button onClick={() => deletePatient(p)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50" title="Mover a Papelera">
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
          )}

          {/* VISTA TRIAJE */}
          {view === 'triage' && (
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-xl shadow border border-blue-100 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-blue-800 flex items-center"><Clipboard className="w-5 h-5 mr-2" /> Lista de Pacientes del Día</h3>
                  <p className="text-xs text-gray-500 mt-1">Gestiona el flujo de pacientes, pagos y exámenes.</p>
                </div>
                <div className="flex gap-2">
                  {selectedTriageItems.length > 0 && (
                    <button
                      onClick={handleTriageBulkDelete}
                      className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar ({selectedTriageItems.length})
                    </button>
                  )}
                  <button onClick={fetchDailyAppointments} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-200 flex items-center">
                    <RefreshCw className="w-4 h-4 mr-2" /> Actualizar Lista
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow overflow-hidden">
                {listDate && (
                  <div className="bg-blue-50 p-3 border-b border-blue-100 flex justify-center items-center gap-4">
                    <h4 className="font-bold text-blue-800 text-lg">LISTA DEL DÍA:</h4>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-white border border-blue-300 text-blue-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 font-bold"
                    />
                  </div>

                )}
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-600">
                      <tr>
                        <th className="p-4 w-12">
                          <input
                            type="checkbox"
                            onChange={(e) => handleTriageSelectAll(e, dailyList)}
                            checked={dailyList.length > 0 && selectedTriageItems.length === dailyList.length}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-4 w-16">Orden</th>
                        <th className="p-4">Hora</th>
                        <th className="p-4">Paciente</th>
                        <th className="p-4">Celular</th>
                        <th className="p-4">Notas</th>
                        <th className="p-4">Estado / Flujo</th>
                        <th className="p-4">Gestión (Pagos / Exámenes)</th>
                        <th className="p-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {dailyList.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay citas programadas para hoy.</td></tr>}
                      {dailyList.map((p, index) => (
                        <tr key={p.id} className={`hover:bg-gray-50 ${p.triage_status === 'attended' ? 'bg-green-50 opacity-60' : ''} ${p.triage_status === 'arrived' ? 'bg-yellow-50' : ''}`}>
                          <td className="p-4 align-top">
                            <input
                              type="checkbox"
                              checked={selectedTriageItems.includes(p.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTriageItems([...selectedTriageItems, p.id]);
                                } else {
                                  setSelectedTriageItems(selectedTriageItems.filter(id => id !== p.id));
                                }
                              }}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                            />
                          </td>
                          <td className="p-4 font-bold text-slate-400 text-center">
                            {index + 1}
                          </td>
                          <td className="p-4 text-sm font-mono font-bold text-blue-900">
                            {editingAppointment?.id === p.id ? (
                              <div className="flex flex-col gap-1">
                                <input
                                  type="date"
                                  value={editingAppointment.date}
                                  onChange={e => setEditingAppointment({ ...editingAppointment, date: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTime()}
                                  className="text-xs border rounded p-1"
                                />
                                <input
                                  type="time"
                                  value={editingAppointment.time}
                                  onChange={e => setEditingAppointment({ ...editingAppointment, time: e.target.value })}
                                  onKeyDown={(e) => e.key === 'Enter' && handleSaveTime()}
                                  className="text-xs border rounded p-1"
                                  step="300"
                                />
                                <div className="flex gap-1 mt-1">
                                  <button onClick={handleSaveTime} className="bg-green-100 text-green-700 p-1 rounded hover:bg-green-200"><Save className="w-3 h-3" /></button>
                                  <button onClick={() => setEditingAppointment(null)} className="bg-red-100 text-red-700 p-1 rounded hover:bg-red-200"><X className="w-3 h-3" /></button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group">
                                <span>{new Date(p.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                                <button
                                  onClick={() => {
                                    const d = new Date(p.appointment_date);
                                    setEditingAppointment({
                                      id: p.id,
                                      date: d.toISOString().split('T')[0],
                                      time: d.toTimeString().slice(0, 5)
                                    });
                                  }}
                                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 transition-opacity"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{p.patient_name}</div>
                            <div className="text-xs text-gray-500">
                              DNI: {p.patient_dni} | {p.patient_age} {(p.patient_age && !p.patient_age.toLowerCase().includes('años') && !p.patient_age.toLowerCase().includes('meses')) ? 'años' : ''}
                            </div>
                            {p.symptoms && <div className="text-xs text-gray-400 italic mt-1 truncate max-w-[200px]">{p.symptoms}</div>}
                          </td>
                          <td className="p-4">
                            {p.patient_phone ? (
                              <a
                                href={`https://wa.me/51${p.patient_phone.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-green-600 hover:text-green-800 font-bold text-sm bg-green-50 px-2 py-1 rounded border border-green-200 hover:bg-green-100 transition-colors w-fit"
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                {p.patient_phone}
                              </a>
                            ) : (
                              <span className="text-gray-400 text-xs">-</span>
                            )}
                          </td>
                          <td className="p-4">
                            <textarea
                              defaultValue={p.notes || ''}
                              onBlur={(e) => updateAppointmentField(p.id, 'notes', e.target.value)}
                              className="w-full h-16 text-xs border border-gray-200 rounded p-1 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none bg-yellow-50/30"
                              placeholder="Agregar nota..."
                            ></textarea>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="flex gap-1">
                                <button
                                  onClick={() => updateTriageStatus(p.id, 'confirmed')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${p.triage_status === 'confirmed' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                  Confirmó
                                </button>
                                <button
                                  onClick={() => updateTriageStatus(p.id, 'arrived')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${p.triage_status === 'arrived' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                  Llegó
                                </button>
                                <button
                                  onClick={() => updateTriageStatus(p.id, 'attended')}
                                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors ${p.triage_status === 'attended' ? 'bg-green-200 text-green-800 border-green-300' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
                                >
                                  Atendido
                                </button>
                              </div>
                              <div className="text-[10px] text-center font-bold text-slate-400 uppercase tracking-wider">
                                {p.triage_status === 'pending' ? 'Pendiente' :
                                  p.triage_status === 'confirmed' ? 'Confirmado' :
                                    p.triage_status === 'arrived' ? 'En Sala' : 'Finalizado'}
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={p.payment_status === 'paid'}
                                  onChange={(e) => updateAppointmentField(p.id, 'payment_status', e.target.checked ? 'paid' : 'pending')}
                                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                />
                                <span className={`text-xs font-bold ${p.payment_status === 'paid' ? 'text-green-700' : 'text-gray-400'}`}>
                                  {p.payment_status === 'paid' ? 'PAGADO' : 'Pendiente Pago'}
                                </span>
                              </label>
                              <input
                                type="text"
                                placeholder="Exámenes compl..."
                                value={p.complementary_exams || ''}
                                onChange={(e) => updateAppointmentField(p.id, 'complementary_exams', e.target.value)}
                                className="w-full text-xs border border-gray-200 rounded p-1 focus:border-blue-300 focus:ring-1 focus:ring-blue-200"
                              />
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            {p.triage_status !== 'attended' && (user.role === 'doctor' || user.role === 'admin') && (
                              <button onClick={() => { updateTriageStatus(p.id, 'attended'); handleConvertToPatient(p); }} className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-bold hover:bg-blue-700 shadow-sm flex items-center ml-auto">
                                Atender <ArrowRight className="w-3 h-3 ml-1" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VISTA PAPELERA */}
          {view === 'trash' && (
            <div className="max-w-7xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-red-100 overflow-hidden">
                <div className="p-6 border-b bg-gradient-to-r from-red-50 to-orange-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-6 h-6 text-red-600" />
                      <div>
                        <h2 className="text-2xl font-bold text-red-900">Papelera</h2>
                        <p className="text-sm text-red-600">Citas eliminadas - Puedes restaurarlas o eliminarlas permanentemente</p>
                      </div>
                    </div>
                    <button
                      onClick={fetchTrashedAppointments}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-200 flex items-center"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Actualizar
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Fecha Cita</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Paciente</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Motivo</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Eliminado</th>
                        <th className="text-center p-4 text-sm font-bold text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trashedAppointments.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-gray-400">No hay citas en la papelera.</td></tr>}
                      {trashedAppointments.map((apt, index) => {
                        // Group header by date
                        const showDateHeader = index === 0 ||
                          (apt.deleted_at && trashedAppointments[index - 1]?.deleted_at &&
                            new Date(apt.deleted_at).toLocaleDateString() !== new Date(trashedAppointments[index - 1].deleted_at).toLocaleDateString());

                        return (
                          <React.Fragment key={apt.id}>
                            {showDateHeader && apt.deleted_at && (
                              <tr className="bg-slate-100">
                                <td colSpan="5" className="p-3 text-sm font-bold text-slate-700">
                                  📅 {new Date(apt.deleted_at).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </td>
                              </tr>
                            )}
                            <tr className="border-b hover:bg-slate-50 transition-colors">
                              <td className="p-4">
                                <div className="text-sm font-medium text-slate-900">
                                  {apt.appointment_date ? new Date(apt.appointment_date).toLocaleString('es-ES', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }) : 'Sin fecha'}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm font-medium text-slate-900">{apt.patient_name}</div>
                                <div className="text-xs text-slate-500">{apt.patient_phone || 'Sin teléfono'}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-slate-600 max-w-md truncate">{apt.patient_reason || apt.symptoms || 'Sin motivo'}</div>
                              </td>
                              <td className="p-4">
                                <div className="text-xs text-slate-500">
                                  {apt.deleted_at ? (
                                    <>
                                      <div className="font-medium text-red-600">
                                        🕐 {new Date(apt.deleted_at).toLocaleTimeString('es-ES', {
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        })}
                                      </div>
                                      {apt.deleted_from && (
                                        <div className="text-slate-400 mt-1">
                                          📍 {apt.deleted_from}
                                        </div>
                                      )}
                                    </>
                                  ) : (
                                    <div className="text-slate-400">Sin registro</div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex gap-2 justify-center">
                                  <button
                                    onClick={() => restoreAppointment(apt.id)}
                                    className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-green-200 flex items-center gap-1 transition-colors"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Restaurar
                                  </button>
                                  <button
                                    onClick={() => permanentDeleteAppointment(apt.id)}
                                    className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-200 flex items-center gap-1 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {trashedAppointments.length > 0 && (
                  <div className="p-4 bg-slate-50 border-t text-center text-sm text-slate-500">
                    {trashedAppointments.length} {trashedAppointments.length === 1 ? 'cita eliminada' : 'citas eliminadas'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA FORMULARIO */}
          {view === 'form' && (
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex-1 space-y-6">
                {isNewPatient && (
                  <div className="bg-blue-50 border-dashed border-2 border-blue-200 p-4 rounded-lg text-center no-print">
                    <p className="text-xs text-blue-600 font-bold mb-2">PEGAR FILA DE EXCEL AQUÍ</p>
                    <input type="text" className="w-full text-xs border p-1 rounded" value={importText} onChange={handleImport} placeholder="Ctrl + V" />
                  </div>
                )}

                <form onSubmit={onFormSubmit} className="bg-white rounded-xl shadow border p-6 space-y-6">
                  <div className={!isNewPatient ? "opacity-80" : ""}>
                    <h3 className="font-bold text-blue-800 border-b pb-2 mb-4 flex items-center"><User className="w-4 h-4 mr-2" /> 1. Filiación y Contacto</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div className="col-span-2"><label className="text-xs font-bold">Nombre Completo</label><input required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full border p-2 rounded" readOnly={!isNewPatient} /></div>
                      <div><label className="text-xs font-bold">DNI</label><input name="id" value={formData.id} onChange={handleChange} className="w-full border p-2 rounded" readOnly={!isNewPatient} /></div>
                      <div><label className="text-xs font-bold bg-yellow-100 px-1 rounded">Fecha Cita</label><input type="datetime-local" name="fechaCita" value={formData.fechaCita} onChange={handleChange} className="w-full border p-2 rounded bg-yellow-50 font-bold" /></div>
                      <div><label className="text-xs font-bold">Edad</label><input name="edad" type="text" value={formData.edad} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Ej: 25 Años" /></div>
                      <div><label className="text-xs font-bold">Fecha Nacimiento</label><input name="fechaNacimiento" type="date" value={formData.fechaNacimiento} onChange={handleChange} className="w-full border p-2 rounded text-sm" /></div>
                      <div><label className="text-xs font-bold">Celular</label><input name="celular" value={formData.celular} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                      <div><label className="text-xs font-bold">Ocupación</label><input name="ocupacion" value={formData.ocupacion} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                      <div><label className="text-xs font-bold">Procedencia</label><input name="procedencia" value={formData.procedencia} onChange={handleChange} className="w-full border p-2 rounded" /></div>
                      <div>
                        <label className="text-xs font-bold">Sexo</label>
                        <select name="sexo" value={formData.sexo} onChange={handleChange} className="w-full border p-2 rounded bg-white">
                          <option value="Mujer">Mujer</option>
                          <option value="Hombre">Hombre</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                      {formData.sexo === 'Mujer' && (
                        <div><label className="text-xs font-bold text-pink-600">F.U.R (Última Regla)</label><input type="date" name="fur" value={formData.fur} onChange={handleChange} className="w-full border p-2 rounded border-pink-200 bg-pink-50" /></div>
                      )}
                      <div className="col-span-2"><label className="text-xs font-bold text-blue-800">Referencia</label><input name="referencia" value={formData.referencia} onChange={handleChange} className="w-full border p-2 rounded" placeholder="¿Cómo nos encontró?" /></div>
                    </div>
                  </div>

                  {(user.role === 'doctor' || user.role === 'admin') && (<>
                    <div className="bg-gray-50 p-4 rounded border">
                      <h3 className="font-bold text-gray-700 text-sm mb-3 flex items-center"><History className="w-4 h-4 mr-2" /> 2. Antecedentes Médicos</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs font-bold text-red-600">Alergias</label><input name="alergias" value={formData.alergias} onChange={handleChange} className="w-full border p-1 rounded text-sm border-red-200" placeholder="Ninguna" /></div>
                        <div><label className="text-xs font-bold">Enfermedades</label><input name="enfermedades" value={formData.enfermedades} onChange={handleChange} className="w-full border p-1 rounded text-sm" /></div>
                        <div><label className="text-xs font-bold">Medicamentos Uso</label><input name="medicamentos" value={formData.medicamentos} onChange={handleChange} className="w-full border p-1 rounded text-sm" /></div>
                        <div><label className="text-xs font-bold">Cirugías</label><input name="cirugias" value={formData.cirugias} onChange={handleChange} className="w-full border p-1 rounded text-sm" /></div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold flex items-center mb-1"><Clipboard className="w-3 h-3 mr-1" /> 3. Motivo de Consulta</label>
                      <textarea name="resumen" value={formData.resumen} onChange={handleChange} rows={3} className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-500" placeholder="Relato del paciente..."></textarea>
                    </div>

                    <div>
                      <h3 className="font-bold text-blue-800 border-b pb-2 mb-2 flex items-center"><Stethoscope className="w-4 h-4 mr-2" /> 4. Examen Físico</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {['oido', 'nariz', 'garganta'].map(part => (
                          <div key={part} className="bg-gray-50 p-2 rounded border flex flex-col">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold uppercase">{part}</span>
                              <div className="flex gap-1">{EXAM_TEMPLATES[part].map((t, i) => <button type="button" key={i} onClick={() => addExamTemplate('examen' + part.charAt(0).toUpperCase() + part.slice(1), t.text)} className="px-2 py-0.5 bg-white border text-[10px] rounded hover:bg-blue-100">{t.label}</button>)}</div>
                            </div>
                            <textarea name={'examen' + part.charAt(0).toUpperCase() + part.slice(1)} value={formData['examen' + part.charAt(0).toUpperCase() + part.slice(1)]} onChange={handleChange} rows={1} className="w-full border p-1 rounded text-sm"></textarea>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                      <h3 className="font-bold text-blue-800 border-b border-blue-200 pb-2 mb-4 flex items-center"><ListPlus className="w-4 h-4 mr-2" /> 5. Diagnóstico</h3>
                      <div className="flex gap-2 mb-2">
                        <select onChange={selectCommonDiagnosis} className="flex-1 p-2 border border-blue-300 rounded text-sm font-bold text-gray-700">
                          <option value="">-- Diagnósticos Frecuentes --</option>
                          {Object.entries(DIAGNOSTICOS_COMUNES).map(([categoria, items]) => (
                            <optgroup key={categoria} label={categoria}>
                              {items.map((d, i) => <option key={i} value={d.label}>{d.label}</option>)}
                            </optgroup>
                          ))}
                        </select>
                        <select onChange={selectProtocol} className="flex-1 p-2 border border-blue-300 rounded text-sm font-bold text-gray-700">
                          <option value="">-- Cargar Protocolo (Receta + Indicaciones) --</option>
                          {Object.entries(CATALOGO_MEDICO).map(([categoria, items]) => (
                            <optgroup key={categoria} label={categoria}>
                              {items.map((p, i) => <option key={i} value={p.label}>{p.label}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2 mb-2">

                        <input placeholder="CIE10" value={diagInput.code} onChange={e => setDiagInput({ ...diagInput, code: e.target.value.toUpperCase() })} className="w-20 border p-2 rounded text-sm" />
                        <input placeholder="Otro diagnóstico..." value={diagInput.desc} onChange={e => setDiagInput({ ...diagInput, desc: e.target.value })} className="flex-1 border p-2 rounded text-sm" />
                        <button type="button" onClick={addManualDiagnosis} className="bg-blue-100 px-3 rounded hover:bg-blue-200"><Plus className="w-4 h-4" /></button>
                      </div>
                      <div className="space-y-1 mb-4">
                        {formData.diagnosticos.map((d, i) => (<div key={i} className="flex justify-between bg-white border border-blue-100 p-1 px-2 rounded text-sm"><span className="font-bold mr-2 text-blue-700">{d.code}</span>{d.desc}<button type="button" onClick={() => removeDiagnosis(i)} className="text-red-500 ml-2"><Trash2 className="w-3 h-3" /></button></div>))}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-bold text-blue-800 border-b pb-2 mb-2 flex items-center"><Pill className="w-4 h-4 mr-2" /> 6. Tratamiento (Receta)</h3>

                      <datalist id="meds-list">
                        {getFilteredVademecum().map((m, i) => <option key={i} value={m.med} />)}
                      </datalist>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-gray-200 mb-2">
                          <thead className="bg-gray-100">
                            <tr>
                              <th className="text-left p-2 w-1/3">Medicamento</th>
                              <th className="text-left p-2 w-16">Cant.</th>
                              <th className="text-left p-2">Indicaciones</th>
                              <th className="text-left p-2 w-16">Vía</th>
                              <th className="text-left p-2 w-20">Duración</th>
                              <th className="w-8"></th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.receta.map((row, idx) => (
                              <tr key={idx} className="border-b">
                                <td className="p-1"><input list="meds-list" className="w-full border p-1" value={row.med} onChange={(e) => updateMedicationRow(idx, 'med', e.target.value)} /></td>
                                <td className="p-1"><input className="w-full border p-1" value={row.cant} onChange={(e) => updateMedicationRow(idx, 'cant', e.target.value)} /></td>
                                <td className="p-1"><input className="w-full border p-1" value={row.ind} onChange={(e) => updateMedicationRow(idx, 'ind', e.target.value)} /></td>
                                <td className="p-1"><input className="w-full border p-1" value={row.via} onChange={(e) => updateMedicationRow(idx, 'via', e.target.value)} /></td>
                                <td className="p-1"><input className="w-full border p-1" value={row.dur} onChange={(e) => updateMedicationRow(idx, 'dur', e.target.value)} /></td>
                                <td className="p-1 text-center"><button type="button" onClick={() => removeMedicationRow(idx)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button></td>
                              </tr>
                            ))}
                            {formData.receta.length === 0 && <tr><td colSpan="6" className="p-4 text-center text-gray-400 italic">Use el Vademécum lateral para agregar medicamentos</td></tr>}
                          </tbody>
                        </table>
                      </div>

                      {/* Vademécum Sugerido (Chips) */}
                      <div className="mt-2 mb-4 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                        <label className="text-xs font-bold text-blue-700 mb-2 block flex items-center"><Pill className="w-3 h-3 mr-1" /> Vademécum Sugerido (Click para agregar)</label>
                        <div className="flex flex-wrap gap-2">
                          {getFilteredVademecum().map((m, i) => (
                            <button key={i} type="button" onClick={() => addMedicationRow(m)} className="text-xs bg-white text-gray-700 px-2 py-1 rounded border border-gray-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-300 transition-colors shadow-sm">
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="text-xs font-bold text-gray-600">Indicaciones Adicionales</label>
                        <textarea name="indicaciones" value={formData.indicaciones} onChange={handleChange} rows={2} className="w-full border p-2 rounded text-sm"></textarea>
                      </div>
                    </div>
                  </>)}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button type="button" onClick={() => navigate('list')} className="px-4 py-2 border rounded text-gray-600">Cancelar</button>
                    <button type="submit" className="px-6 py-2 bg-blue-700 text-white rounded shadow font-bold hover:bg-blue-800">GUARDAR CONSULTA</button>
                  </div>
                </form>
              </div>


            </div>
          )}

          {/* VISTA DETALLE (HISTORIAL) */}
          {view === 'detail' && selectedPatient && (
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
              {/* HEADER: DATOS CLÍNICOS CRÍTICOS */}
              <div className="col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 mb-2 no-print">
                {/* CARD 1: FILIACIÓN */}
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <h3 className="font-bold text-blue-800 flex items-center mb-3"><User className="w-4 h-4 mr-2" /> FILIACIÓN Y CONTACTO</h3>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="col-span-2 font-bold text-lg text-gray-800">{selectedPatient.nombre}</div>
                    <div className="flex items-center text-gray-600"><CalendarDays className="w-3 h-3 mr-2" /> {selectedPatient.edad} {(!selectedPatient.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</div>
                    <div className="flex items-center text-gray-600">
                      <Phone className="w-3 h-3 mr-2" />
                      <a href={`https://wa.me/51${selectedPatient.celular?.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 hover:underline">
                        {selectedPatient.celular}
                      </a>
                    </div>
                    <div className="flex items-center text-gray-600"><Mail className="w-3 h-3 mr-2" /> {selectedPatient.email || '-'}</div>
                    <div className="col-span-2 text-xs text-gray-500 mt-2 pt-2 border-t">Ref: {selectedPatient.referencia}</div>
                  </div>
                </div>

                {/* CARD 2: ANTECEDENTES */}
                <div className="p-4 rounded-lg border shadow-sm bg-white border-gray-200">
                  <h3 className="font-bold flex items-center mb-3 text-gray-700"><History className="w-4 h-4 mr-2" /> ANTECEDENTES</h3>
                  <div className="space-y-2 text-sm">
                    {selectedPatient.alergias && <div className="flex text-red-700 font-bold"><span className="w-24">ALERGIAS:</span> <span>{selectedPatient.alergias}</span></div>}
                    <div className="flex"><span className="w-24 font-bold text-gray-500">Patologías:</span> {selectedPatient.enfermedades || 'Niega'}</div>
                    <div className="flex"><span className="w-24 font-bold text-gray-500">Cirugías:</span> {selectedPatient.cirugias || 'Ninguna'}</div>
                  </div>
                </div>
              </div>

              {/* ACTIONS BAR */}
              <div className="col-span-3 flex justify-end gap-2 mb-2 no-print">
                <button onClick={() => prepareFormForNewConsultation(selectedPatient)} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 flex items-center"><Plus className="w-4 h-4 mr-2" /> NUEVA CONSULTA</button>
                <button onClick={() => navigate('list')} className="border px-4 py-2 rounded text-sm hover:bg-gray-50">VOLVER</button>
              </div>

              {/* COLUMNA IZQUIERDA: HISTORIAL */}
              <div className="md:col-span-1 bg-white rounded-lg shadow border overflow-y-auto no-print">
                <div className="p-3 bg-gray-50 border-b font-bold text-xs text-gray-500 uppercase sticky top-0">Historial</div>
                <div className="divide-y">
                  {(selectedPatient.consultas || [selectedPatient]).map((consulta, idx) => (
                    <div key={idx} onClick={() => setSelectedConsultationIndex(idx)} className={`p-3 cursor-pointer hover:bg-blue-50 ${selectedConsultationIndex === idx ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}>
                      <div className="font-bold text-sm text-gray-800 mb-1">{new Date(consulta.fechaCita).toLocaleDateString()}</div>
                      <div className="text-xs text-blue-700 font-medium mb-1">{consulta.diagnosticos && consulta.diagnosticos.length > 0 ? consulta.diagnosticos[0].desc : 'S/D'}</div>
                      {consulta.atendidoPor && (
                        <div className="text-[10px] text-gray-500 flex items-center">
                          <User className="w-3 h-3 mr-1" /> {consulta.atendidoPor}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* COLUMNA DERECHA: CONSULTA CLÍNICA */}
              <div className="md:col-span-2 bg-white rounded-lg shadow border flex flex-col overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-6 no-print">
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Clipboard className="w-5 h-5 mr-2 text-teal-600" />
                        Consulta del {new Date(getDisplayConsultation().fechaCita).toLocaleDateString()}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1"><strong>Motivo:</strong> {getDisplayConsultation().resumen}</p>
                    </div>
                    {/* BOTÓN ABRIR RECETA MODAL */}
                    <button onClick={openPrescriptionModal} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700 flex items-center shadow-lg transform hover:scale-105 transition-all">
                      <FileText className="w-4 h-4 mr-2" /> 📄 Abrir Receta (A5)
                    </button>
                    <button onClick={handleEditConsultation} className="bg-orange-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-orange-600 flex items-center shadow-lg transform hover:scale-105 transition-all ml-2">
                      <Edit3 className="w-4 h-4 mr-2" /> Editar
                    </button>
                  </div>

                  {/* Examen Físico */}
                  <div className="grid grid-cols-1 gap-2">
                    <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1 mb-1">Examen Físico</h4>
                    <div className="bg-gray-50 p-3 rounded border grid grid-cols-3 gap-4">
                      <div><strong className="text-xs text-teal-700 block">OÍDO</strong><p className="text-xs">{getDisplayConsultation().examenOido || '-'}</p></div>
                      <div><strong className="text-xs text-teal-700 block">NARIZ</strong><p className="text-xs">{getDisplayConsultation().examenNariz || '-'}</p></div>
                      <div><strong className="text-xs text-teal-700 block">GARGANTA</strong><p className="text-xs">{getDisplayConsultation().examenGarganta || '-'}</p></div>
                    </div>
                  </div>

                  {/* Diagnósticos */}
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 uppercase border-b pb-1 mb-2">Diagnósticos</h4>
                    <div className="space-y-1">
                      {getDisplayConsultation().diagnosticos?.map((d, i) => (
                        <div key={i} className="flex items-center text-sm">
                          <span className="bg-teal-100 text-teal-800 text-xs font-bold px-2 py-0.5 rounded mr-2">{d.code}</span>
                          {d.desc}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MODAL RECETA A5 (EDITABLE Y PARA IMPRIMIR) */}
          {isPrescriptionOpen && selectedPatient && (
            <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center overflow-y-auto p-4">
              <div className="bg-white w-full max-w-4xl rounded-lg shadow-2xl relative">

                {/* Header Modal */}
                <div className="flex justify-between items-center p-4 border-b bg-gray-100 rounded-t-lg no-print">
                  <h3 className="font-bold text-gray-700 flex items-center"><Edit3 className="w-4 h-4 mr-2" /> Vista Previa Receta (A5 Horizontal)</h3>
                  <div className="flex gap-2">
                    <button onClick={handleUpdatePrescription} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-green-700">Guardar Cambios</button>
                    <button onClick={() => saveConsultation()} className="bg-blue-800 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-900 flex items-center border border-blue-600"><Save className="w-3 h-3 mr-1" /> Guardar y Finalizar</button>
                    <button onClick={printPrescription} className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold hover:bg-blue-700 flex items-center"><Printer className="w-3 h-3 mr-1" /> Imprimir</button>
                    <button onClick={() => setIsPrescriptionOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-5 h-5" /></button>
                  </div>
                </div>

                {/* Contenido A5 (EDITABLE) */}
                <div id="printable-area" className="bg-white text-black relative mx-auto flex flex-col overflow-hidden" style={{ width: '210mm', height: '148mm', padding: '5mm 8mm' }}>

                  {/* Encabezado */}
                  <div className="border-b-[2px] border-blue-900 pb-1 mb-1 flex justify-between items-end">
                    <div>
                      <h1 className="text-xl font-bold text-blue-900 uppercase tracking-wide leading-none">{DOCTOR_INFO.nombre}</h1>
                      <p className="text-xs font-bold text-gray-600 uppercase mt-1 leading-none tracking-wider">{DOCTOR_INFO.especialidad}</p>
                      <p className="text-[10px] text-gray-500 tracking-widest mt-0.5 leading-none">{DOCTOR_INFO.credenciales}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-blue-800 font-bold mb-0.5">{DOCTOR_INFO.contacto}</p>
                      <div className="font-bold text-xs text-gray-800 leading-none">{new Date(getDisplayConsultation().fechaCita).toLocaleDateString()}</div>
                    </div>
                  </div>

                  {/* Datos Paciente */}
                  <div className="mb-1 text-xs border-y border-blue-100 py-0.5 bg-blue-50/30">
                    <div className="flex justify-between items-center px-2">
                      <div className="flex-1 flex items-baseline gap-2">
                        <span className="font-bold text-blue-900 uppercase text-[10px]">PACIENTE:</span>
                        <span className="font-medium truncate text-xs">{selectedPatient.nombre}</span>
                      </div>
                      <div className="w-24 flex items-baseline gap-2 justify-end">
                        <span className="font-bold text-blue-900 uppercase text-[10px]">EDAD:</span>
                        <span className="font-medium">{selectedPatient.edad} {(!selectedPatient.edad?.toString().toLowerCase().match(/años|meses/)) ? 'años' : ''}</span>
                      </div>
                      <div className="w-32 flex items-baseline gap-2 justify-end">
                        <span className="font-bold text-blue-900 uppercase text-[10px]">DNI:</span>
                        <span className="font-medium">{selectedPatient.id}</span>
                      </div>
                    </div>
                    <div className="px-2 pt-0.5 flex items-baseline gap-2">
                      <span className="font-bold text-blue-900 uppercase text-[10px]">DX:</span>
                      <span className="truncate italic text-gray-700">{getDisplayConsultation().diagnosticos?.map(d => `${d.code} ${d.desc}`).join(' // ')}</span>
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
          )}

          {
            isPasteModalOpen && (
              <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                <div className="bg-white w-full max-w-2xl rounded-lg shadow-2xl p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Importación Masiva (Copiar y Pegar)</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    1. Abra su Excel.<br />
                    2. Seleccione las filas que desea importar <strong>incluyendo los encabezados</strong>.<br />
                    3. Copie (Ctrl+C) y pegue (Ctrl+V) en el cuadro de abajo.
                  </p>
                  <textarea
                    className="w-full h-64 border p-2 rounded text-xs font-mono bg-gray-50 focus:ring-2 focus:ring-blue-500"
                    placeholder="Pegue aquí los datos de Excel..."
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setIsPasteModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleBulkPaste} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Procesar Importación</button>
                  </div>
                </div>
              </div>
            )
          }

          {/* MODAL GESTIÓN DE DATOS (NUEVO) */}
          {
            isDataModalOpen && (
              <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center"><Briefcase className="w-5 h-5 mr-2" /> Gestión de Datos y Respaldos</h3>
                    <button onClick={() => setIsDataModalOpen(false)} className="hover:text-gray-300"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="flex border-b">
                    <button onClick={() => setDataModalTab('backup')} className={`flex-1 py-3 font-bold text-sm ${dataModalTab === 'backup' ? 'border-b-4 border-blue-600 text-blue-800 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      COPIA DE SEGURIDAD
                    </button>
                    <button onClick={() => setDataModalTab('import')} className={`flex-1 py-3 font-bold text-sm ${dataModalTab === 'import' ? 'border-b-4 border-green-600 text-green-800 bg-green-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      IMPORTAR DATOS (EXCEL)
                    </button>
                    <button onClick={() => setDataModalTab('trash')} className={`flex-1 py-3 font-bold text-sm ${dataModalTab === 'trash' ? 'border-b-4 border-red-600 text-red-800 bg-red-50' : 'text-gray-500 hover:bg-gray-50'}`}>
                      PAPELERA
                    </button>
                  </div>
                  <div className="p-6 overflow-y-auto flex-1">
                    {dataModalTab === 'backup' && (
                      <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                          <h4 className="font-bold text-blue-900 mb-2 flex items-center"><Save className="w-4 h-4 mr-2" /> Exportar / Guardar Backup</h4>
                          <p className="text-sm text-gray-600 mb-4">Descarga una copia completa de tu base de datos en formato JSON. Guarda este archivo en un lugar seguro (USB, Drive).</p>
                          <div className="flex gap-3">
                            <button onClick={exportToJSON} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700 shadow flex items-center">
                              <Download className="w-4 h-4 mr-2" /> Descargar Backup (.json)
                            </button>
                            {directoryHandle ? (
                              <button onClick={saveToFolder} className="bg-teal-600 text-white px-4 py-2 rounded font-bold hover:bg-teal-700 shadow flex items-center">
                                <Save className="w-4 h-4 mr-2" /> Guardar en Carpeta Conectada
                              </button>
                            ) : (
                              <button onClick={handleConnectFolder} className="bg-gray-700 text-white px-4 py-2 rounded font-bold hover:bg-gray-800 shadow flex items-center">
                                <Briefcase className="w-4 h-4 mr-2" /> Conectar Carpeta Local
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                          <h4 className="font-bold text-orange-900 mb-2 flex items-center"><History className="w-4 h-4 mr-2" /> Restaurar Backup</h4>
                          <p className="text-sm text-gray-600 mb-3">Recupera tus datos desde un archivo `.json` previamente guardado.</p>

                          <div className="flex items-center gap-4 mb-4 bg-white p-3 rounded border">
                            <span className="text-sm font-bold text-gray-700">Modo de Restauración:</span>
                            <label className="flex items-center text-sm cursor-pointer">
                              <input type="radio" name="restoreMode" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} className="mr-1" />
                              <span className="font-bold text-blue-700">Fusión (Merge)</span>
                              <span className="text-xs text-gray-500 ml-1">- Agrega nuevos, mantiene existentes.</span>
                            </label>
                            <label className="flex items-center text-sm cursor-pointer">
                              <input type="radio" name="restoreMode" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} className="mr-1" />
                              <span className="font-bold text-red-600">Reemplazo Total</span>
                              <span className="text-xs text-gray-500 ml-1">- BORRA TODO y restaura.</span>
                            </label>
                          </div>

                          <label className="block w-full border-2 border-dashed border-orange-300 rounded-lg p-8 text-center cursor-pointer hover:bg-orange-100 transition-colors">
                            <Download className="w-8 h-8 mx-auto text-orange-400 mb-2" />
                            <span className="font-bold text-orange-800 block">Click para seleccionar archivo backup (.json)</span>
                            <input type="file" accept=".json" onChange={handleRestoreBackupFile} className="hidden" />
                          </label>
                        </div>
                      </div>
                    )}

                    {dataModalTab === 'import' && (
                      <div className="space-y-4">
                        {!importPreview ? (
                          <>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                              <h4 className="font-bold text-green-900 mb-2">Importar desde Excel</h4>
                              <p className="text-sm text-gray-600 mb-4">Sube tu archivo Excel con la lista de pacientes. El sistema intentará detectar automáticamente las columnas.</p>
                              <label className="block w-full border-2 border-dashed border-green-300 rounded-lg p-8 text-center cursor-pointer hover:bg-green-100 transition-colors">
                                <FileText className="w-8 h-8 mx-auto text-green-500 mb-2" />
                                <span className="font-bold text-green-800 block">Click para subir Excel (.xlsx)</span>
                                <input type="file" accept=".xlsx, .xls" onChange={handlePreviewExcel} className="hidden" />
                              </label>
                            </div>
                            <div className="text-center text-gray-400 text-xs font-bold uppercase my-2">- O -</div>
                            <button onClick={() => { setIsDataModalOpen(false); setIsPasteModalOpen(true); }} className="w-full py-3 border-2 border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 flex justify-center items-center">
                              <Clipboard className="w-4 h-4 mr-2" /> Pegar datos desde Portapapeles (Ctrl+V)
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="font-bold text-gray-800">Vista Previa ({importPreview.fileName})</h4>
                              <button onClick={() => setImportPreview(null)} className="text-red-500 text-xs font-bold hover:underline">Cancelar / Volver</button>
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
                                  <input type="radio" name="importMode" checked={importMode === 'merge'} onChange={() => setImportMode('merge')} className="mr-2" />
                                  <div>
                                    <span className="font-bold text-gray-800 block">Fusionar (Recomendado)</span>
                                    <span className="text-xs text-gray-500">Agrega pacientes nuevos. No borra los existentes.</span>
                                  </div>
                                </label>
                                <label className="flex items-center text-sm cursor-pointer">
                                  <input type="radio" name="importMode" checked={importMode === 'replace'} onChange={() => setImportMode('replace')} className="mr-2" />
                                  <div>
                                    <span className="font-bold text-red-600 block">Reemplazar Todo</span>
                                    <span className="text-xs text-gray-500">Borra la base de datos actual y carga el Excel.</span>
                                  </div>
                                </label>
                              </div>
                              <button onClick={processImport} className="w-full bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700 shadow-lg">
                                CONFIRMAR IMPORTACIÓN ({importPreview.fullData.length} Registros)
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {dataModalTab === 'trash' && (
                      <TrashView user={user} />
                    )}
                  </div>
                </div>
              </div>
            )
          }
          {/* VISTA AGENDA */}
          {
            view === 'agenda' && (
              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Solicitud de Citas</h2>
                    <p className="text-slate-500 text-sm">Solicitudes recibidas desde tu formulario público.</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/citas/${user.clinicId}`;
                        navigator.clipboard.writeText(link);
                        alert("Link de citas copiado al portapapeles");
                      }}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <Link className="w-4 h-4" />
                      Copiar Link Público
                    </button>
                    <button
                      onClick={() => setIsAgendaImportOpen(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <Clipboard className="w-4 h-4" />
                      Importar (Pegar)
                    </button>
                    <button
                      onClick={() => setShowConfirmed(!showConfirmed)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors border ${showConfirmed ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                      {showConfirmed ? 'Ocultar Confirmados' : 'Ver Confirmados'}
                    </button>
                    <button
                      onClick={fetchAppointments}
                      className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                    {selectedAppointments.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar ({selectedAppointments.length})
                      </button>
                    )}
                  </div>
                </div>

                {loadingAppointments ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-500">Cargando agenda...</p>
                  </div>
                ) : appointments.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-slate-100">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarDays className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">No hay citas pendientes</h3>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                      Comparte tu link público para que tus pacientes puedan solicitar citas directamente.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                          <th className="p-4 w-10">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              onChange={(e) => handleSelectAll(e, appointments.filter(a => showConfirmed ? true : a.status !== 'confirmed'))}
                              checked={
                                appointments.filter(a => showConfirmed ? true : a.status !== 'confirmed').length > 0 &&
                                appointments.filter(a => showConfirmed ? true : a.status !== 'confirmed').every(a => selectedAppointments.includes(a.id))
                              }
                            />
                          </th>
                          <th className="p-4 w-48">Fecha / Hora</th>
                          <th className="p-4">Paciente</th>
                          <th className="p-4">Motivo / Antecedentes</th>
                          <th className="p-4 w-32 text-center">Estado</th>
                          <th className="p-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {appointments.filter(a => showConfirmed ? true : a.status !== 'confirmed').map((apt) => (
                          <tr key={apt.id} className={`hover:bg-blue-50/50 transition-colors group ${apt.status === 'confirmed' ? 'bg-green-50/50' : ''} ${selectedAppointments.includes(apt.id) ? 'bg-blue-50' : ''}`}>
                            <td className="p-4 align-top">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1 cursor-pointer"
                                checked={selectedAppointments.includes(apt.id)}
                                onChange={() => handleSelectAppointment(apt.id)}
                              />
                            </td>
                            {/* FECHA Y HORA EDITABLE (AUTO-SAVE) */}
                            <td className="p-4 align-top">
                              <div className="flex flex-col gap-2">
                                <input
                                  key={`date-${apt.id}-${apt.appointment_date}`}
                                  type="date"
                                  className="text-xs font-bold border border-transparent hover:border-blue-200 focus:border-blue-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none"
                                  defaultValue={new Date(apt.appointment_date).toISOString().split('T')[0]}
                                  onBlur={(e) => {
                                    const newDate = e.target.value;
                                    if (newDate && newDate !== new Date(apt.appointment_date).toISOString().split('T')[0]) {
                                      const newDateTime = new Date(`${newDate}T${new Date(apt.appointment_date).toTimeString().slice(0, 5)}`).toISOString();

                                      // Optimistic update
                                      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));

                                      supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                        if (error) { console.error(error); fetchAppointments(); }
                                      });
                                    }
                                  }}
                                />
                                <input
                                  key={`time-${apt.id}-${apt.appointment_date}`}
                                  type="time"
                                  className="text-lg font-bold border border-transparent hover:border-blue-200 focus:border-blue-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none text-slate-800"
                                  defaultValue={new Date(apt.appointment_date).toTimeString().slice(0, 5)}
                                  onBlur={(e) => {
                                    const newTime = e.target.value;
                                    const currentDate = new Date(apt.appointment_date).toISOString().split('T')[0];
                                    const currentTime = new Date(apt.appointment_date).toTimeString().slice(0, 5);

                                    if (newTime && newTime !== currentTime) {
                                      const newDateTime = new Date(`${currentDate}T${newTime}:00`).toISOString();

                                      // Optimistic update
                                      setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));

                                      supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                        if (error) { console.error(error); fetchAppointments(); }
                                      });
                                    }
                                  }}
                                  step="300"
                                />
                              </div>
                            </td>

                            {/* DATOS PACIENTE */}
                            <td className="p-4 align-top">
                              <div className="font-bold text-slate-800 text-sm">{apt.patient_name}</div>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                                {apt.patient_phone && (
                                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <Phone className="w-3 h-3" /> {apt.patient_phone}
                                  </span>
                                )}
                                {apt.patient_age && (
                                  <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                    <User className="w-3 h-3" /> {apt.patient_age}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* MOTIVO */}
                            <td className="p-4 align-top">
                              {apt.symptoms ? (
                                <div className="text-sm text-slate-600 italic bg-yellow-50/50 p-2 rounded border border-yellow-100/50 max-w-xs">
                                  "{apt.symptoms}"
                                </div>
                              ) : (
                                <span className="text-xs text-gray-300 italic">Sin motivo especificado</span>
                              )}
                              {(apt.chronic_illnesses || apt.medications) && (
                                <div className="text-[10px] text-slate-400 mt-1 max-w-xs truncate">
                                  Ant: {[apt.chronic_illnesses, apt.medications].filter(Boolean).join(', ')}
                                </div>
                              )}
                            </td>

                            {/* ESTADO */}
                            <td className="p-4 align-top text-center">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                              </span>
                            </td>

                            {/* ACCIONES */}
                            <td className="p-4 align-top text-right">
                              <div className="flex justify-end items-center gap-2">
                                {apt.status !== 'confirmed' && (
                                  <button
                                    onClick={() => confirmAppointment(apt)}
                                    className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                    title="Confirmar y Mover a Triaje"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                  </button>
                                )}

                                <a
                                  href={`https://wa.me/${apt.patient_phone?.replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${apt.patient_name}, le saludamos del Consultorio Dr. Walter Florez. Le proponemos su cita para el ${new Date(apt.appointment_date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${new Date(apt.appointment_date).toTimeString().slice(0, 5)}. ¿Confirma?`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 border border-green-200"
                                  title="Enviar propuesta por WhatsApp (con fecha/hora actual)"
                                >
                                  <MessageCircle className="w-5 h-5" />
                                </a>

                                <button
                                  onClick={() => deleteAppointment(apt.id)}
                                  className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Eliminar Solicitud"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )
          }

          {/* VISTA AGENDA V2 (BETA) */}
          {
            view === 'agenda-v2' && (
              <div className="p-4 md:p-8 max-w-6xl mx-auto">
                <div className="bg-indigo-600 rounded-xl p-6 mb-6 text-white shadow-lg relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-white text-indigo-600 text-xs font-bold px-2 py-1 rounded-full">BETA v2.0</span>
                      <h2 className="text-2xl font-bold">Agenda Inteligente</h2>
                    </div>
                    <p className="text-indigo-100 max-w-2xl">
                      Esta es una vista experimental para probar la nueva lógica de horarios. Aquí verás las citas agendadas a través del nuevo formulario v2.0.
                    </p>
                  </div>
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-indigo-500 to-transparent opacity-50"></div>
                </div>

                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">Próximas Citas (v2)</h3>
                  </div>
                  <div className="flex gap-2">
                    {selectedAppointments.length > 0 && (
                      <button
                        onClick={handleBulkDelete}
                        className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar ({selectedAppointments.length})
                      </button>
                    )}
                    <button
                      onClick={() => setShowAgendaImportModal(true)}
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition-colors flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Importar Excel
                    </button>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}/citas-v2/${user.clinicId}`;
                        navigator.clipboard.writeText(link);
                        alert("Link de citas v2 copiado al portapapeles");
                      }}
                      className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-medium hover:bg-indigo-200 transition-colors flex items-center gap-2"
                    >
                      <Link className="w-4 h-4" />
                      Copiar Link v2.0
                    </button>
                    <button
                      onClick={fetchAppointments}
                      className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Reutilizamos la tabla de citas por ahora, pero filtrada o destacada */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="p-4 w-12">
                          <input
                            type="checkbox"
                            onChange={(e) => handleSelectAll(e, appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed') && a.symptoms && a.symptoms.includes('[Ticket:')))}
                            checked={appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed') && a.symptoms && a.symptoms.includes('[Ticket:')).length > 0 && selectedAppointments.length === appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed') && a.symptoms && a.symptoms.includes('[Ticket:')).length}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="p-4 w-48">Fecha / Hora</th>
                        <th className="p-4">Paciente</th>
                        <th className="p-4">Motivo / Antecedentes</th>
                        <th className="p-4 w-32 text-center">Estado</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {appointments.filter(a => (showConfirmed ? true : a.status !== 'confirmed') && a.symptoms && a.symptoms.includes('[Ticket:')).map((apt) => (
                        <tr key={apt.id} className={`hover:bg-indigo-50/30 transition-colors group ${apt.status === 'confirmed' ? 'bg-green-50/50' : ''}`}>
                          {/* CHECKBOX */}
                          <td className="p-4 align-top">
                            <input
                              type="checkbox"
                              checked={selectedAppointments.includes(apt.id)}
                              onChange={() => handleSelectAppointment(apt.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-2"
                            />
                          </td>
                          {/* FECHA Y HORA EDITABLE (AUTO-SAVE) */}
                          <td className="p-4 align-top">
                            <div className="flex flex-col gap-2">
                              <input
                                key={`date-v2-${apt.id}-${apt.appointment_date}`}
                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                type="date"
                                className="text-xs font-bold border border-transparent hover:border-indigo-200 focus:border-indigo-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none"
                                defaultValue={new Date(apt.appointment_date).toISOString().split('T')[0]}
                                onBlur={(e) => {
                                  // Logic duplicated for simplicity in prototype
                                  const newDate = e.target.value;
                                  if (newDate && newDate !== new Date(apt.appointment_date).toISOString().split('T')[0]) {
                                    const newDateTime = new Date(`${newDate}T${new Date(apt.appointment_date).toTimeString().slice(0, 5)}`).toISOString();
                                    setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));
                                    supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                      if (error) console.error(error);
                                      fetchAppointments();
                                    });
                                  }
                                }}
                              />
                              <input
                                key={`time-v2-${apt.id}-${apt.appointment_date}`}
                                onKeyDown={(e) => e.key === 'Enter' && e.target.blur()}
                                type="time"
                                className="text-lg font-bold border border-transparent hover:border-indigo-200 focus:border-indigo-500 rounded p-1 w-full bg-transparent focus:bg-white transition-all outline-none text-slate-800"
                                defaultValue={new Date(apt.appointment_date).toTimeString().slice(0, 5)}
                                onBlur={(e) => {
                                  const newTime = e.target.value;
                                  // Fix: Use local date, not UTC date, to avoid shifting days
                                  const localDate = new Date(apt.appointment_date);
                                  localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
                                  const currentDate = localDate.toISOString().split('T')[0];

                                  const currentTime = new Date(apt.appointment_date).toTimeString().slice(0, 5);
                                  if (newTime && newTime !== currentTime) {
                                    // Construct new date in local time, then convert to UTC
                                    const newDateTime = new Date(`${currentDate}T${newTime}:00`).toISOString();
                                    setAppointments(prev => prev.map(a => a.id === apt.id ? { ...a, appointment_date: newDateTime } : a).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)));
                                    supabase.from('appointments').update({ appointment_date: newDateTime }).eq('id', apt.id).then(({ error }) => {
                                      if (error) { console.error(error); fetchAppointments(); }
                                    });
                                  }
                                }}
                              />
                            </div>
                          </td>

                          {/* DATOS PACIENTE */}
                          <td className="p-4 align-top">
                            <div className="font-bold text-slate-800 text-sm">{apt.patient_name}</div>
                            <div className="flex flex-wrap gap-2 mt-1 text-xs text-slate-500">
                              {apt.patient_phone && (
                                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                  <Phone className="w-3 h-3" /> {apt.patient_phone}
                                </span>
                              )}
                              {apt.patient_age && (
                                <span className="flex items-center gap-1 bg-slate-100 px-1.5 py-0.5 rounded">
                                  <User className="w-3 h-3" /> {apt.patient_age}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* MOTIVO */}
                          <td className="p-4 align-top">
                            {apt.symptoms ? (
                              <div className="text-sm text-slate-600 italic bg-indigo-50/50 p-2 rounded border border-indigo-100/50 max-w-xs">
                                "{apt.symptoms}"
                              </div>
                            ) : (
                              <span className="text-xs text-gray-300 italic">Sin motivo especificado</span>
                            )}
                          </td>

                          {/* ESTADO */}
                          <td className="p-4 align-top text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {apt.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                            </span>
                          </td>

                          {/* ACCIONES */}
                          <td className="p-4 align-top text-right">
                            <div className="flex justify-end items-center gap-2">
                              {apt.status !== 'confirmed' && (
                                <button
                                  onClick={() => confirmAppointment(apt)}
                                  className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                                  title="Confirmar y Mover a Triaje"
                                >
                                  <CheckCircle2 className="w-5 h-5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteAppointment(apt.id)}
                                className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-colors"
                                title="Eliminar Solicitud"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* IMPORT MODAL */}
                {showAgendaImportModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
                        <h3 className="font-bold text-lg flex items-center"><FileText className="w-5 h-5 mr-2" /> Importar desde Excel</h3>
                        <button onClick={() => setShowAgendaImportModal(false)} className="hover:text-green-100"><X className="w-6 h-6" /></button>
                      </div>
                      <div className="p-6">
                        <p className="text-sm text-gray-600 mb-4">
                          Copia las filas de tu Excel y pégalas aquí. El sistema detectará automáticamente fechas, horas y datos del paciente.
                        </p>
                        <textarea
                          value={agendaImportText}
                          onChange={(e) => setAgendaImportText(e.target.value)}
                          placeholder={`Ejemplo:\n3/12/2025\t2.2\tMotivo...\tDNI...\tNombre...`}
                          className="w-full h-64 p-3 border border-gray-300 rounded-lg font-mono text-xs focus:ring-2 focus:ring-green-500 focus:border-green-500 mb-4"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setShowAgendaImportModal(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={handleAgendaImport}
                            disabled={!agendaImportText.trim()}
                            className="px-6 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Procesar Importación
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          }

          {/* MODAL DE GESTIÓN DE EQUIPO */}
          {
            isTeamModalOpen && (
              <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center p-4">
                <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center"><UserPlus className="w-5 h-5 mr-2" /> Agregar Miembro al Equipo</h3>
                    <button onClick={() => setIsTeamModalOpen(false)} className="hover:text-gray-300"><X className="w-6 h-6" /></button>
                  </div>

                  <form onSubmit={handleCreateTeamMember} className="p-6 space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-100 text-sm text-blue-800 mb-4">
                      Crearás una cuenta vinculada a tu consultorio. Tú defines la contraseña inicial.
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
                      <input required type="text" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="w-full border p-2 rounded" placeholder="Dr. Ejemplo" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
                      <input required type="email" value={newMember.email} onChange={e => setNewMember({ ...newMember, email: e.target.value })} className="w-full border p-2 rounded" placeholder="usuario@medsys.local" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Inicial</label>
                      <input required type="text" value={newMember.password} onChange={e => setNewMember({ ...newMember, password: e.target.value })} className="w-full border p-2 rounded bg-yellow-50" placeholder="Mínimo 6 caracteres" />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Rol</label>
                      <select value={newMember.role} onChange={e => setNewMember({ ...newMember, role: e.target.value })} className="w-full border p-2 rounded">
                        <option value="doctor">Médico</option>
                        <option value="assistant">Asistente / Recepción</option>
                      </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button type="button" onClick={() => setIsTeamModalOpen(false)} className="flex-1 py-2 border rounded text-gray-600 font-bold">Cancelar</button>
                      <button type="submit" disabled={teamLoading} className="flex-1 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow disabled:opacity-50">
                        {teamLoading ? 'Creando...' : 'Crear Cuenta'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )
          }
          {/* MODAL IMPORTACIÓN AGENDA */}
          {
            isAgendaImportOpen && (
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
                    value={agendaPasteText}
                    onChange={(e) => setAgendaPasteText(e.target.value)}
                  ></textarea>
                  <div className="flex justify-end gap-3 mt-4">
                    <button onClick={() => setIsAgendaImportOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100">Cancelar</button>
                    <button onClick={handleAgendaImport} className="px-6 py-2 bg-green-600 text-white rounded font-bold hover:bg-green-700">Procesar Importación</button>
                  </div>
                </div>
              </div>
            )
          }
        </div>
      </main>
    </div>
  );
}