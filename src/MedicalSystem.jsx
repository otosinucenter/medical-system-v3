import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  UserPlus, Users, Search, Save, FileText, Calendar, Phone, Activity,
  ChevronRight, User, Clipboard, ArrowDownCircle, Stethoscope, Plus,
  Trash2, ListPlus, Pill, Ear, Smile, Mic2, Printer, Baby, Info,
  HelpCircle, Download, AlertCircle, History, Clock, Eye, MapPin,
  Briefcase, Mail, AlertTriangle, CalendarDays, FileSignature, Edit3, X, LogOut, MessageCircle, Link,
  RefreshCw, ChevronUp, ChevronDown, ArrowRight, CheckCircle2, Settings
} from 'lucide-react';
import { supabase } from './supabaseClient';
import { createClient } from '@supabase/supabase-js';
import logger from './utils/logger';



import ConfiguracionHorarios from './ConfiguracionHorarios';
import TrashView from './components/TrashView';
import PrescriptionModal from './components/PrescriptionModal';
import TriageView from './components/TriageView';
import AgendaView from './components/AgendaView';
import PatientHistoryView from './components/PatientHistoryView';
import PatientListView from './components/PatientListView';
import DataManagementModal from './components/DataManagementModal';
import SidebarNav from './components/SidebarNav';
import TeamModal from './components/TeamModal';
import AgendaImportModal from './components/AgendaImportModal';
import { DOCTOR_INFO, VADEMECUM_TABULAR, DIAGNOSTICOS_COMUNES, EXAM_TEMPLATES, CATALOGO_MEDICO } from './data/constants';

export default function MedicalSystem({ user, onLogout }) {
  logger.log("MedicalSystem user prop:", user);
  const [view, setView] = useState('triage'); // triage, patients, history, agenda, agenda-v2, config
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [importText, setImportText] = useState('');
  const [diagInput, setDiagInput] = useState({ code: '', desc: '' });
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [selectedConsultationIndex, setSelectedConsultationIndex] = useState(0);
  const [editingConsultationIndex, setEditingConsultationIndex] = useState(null); // Nuevo estado para edición

  // Estado para el Modal de Receta
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);

  // Estado para Importación Masiva (Pegar)
  const [isPasteModalOpen, setIsPasteModalOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");

  // --- GESTIÓN DE DATOS (NUEVO) ---
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState(null); // { headers: [], rows: [] }
  const [importMode, setImportMode] = useState('merge'); // 'merge' | 'replace'
  const [selectedAppointments, setSelectedAppointments] = useState([]); // For bulk delete in Agenda
  const [selectedTriageItems, setSelectedTriageItems] = useState([]); // For bulk delete in Triage
  const [selectedTrashItems, setSelectedTrashItems] = useState([]); // For bulk actions in Trash

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
      logger.error(err);
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
      logger.error(err);
      alert("Error al guardar en la carpeta.");
    }
  };

  const _loadFromFolder = async () => {
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
      logger.error(err);
      alert("No se encontró 'patients.json' en la carpeta o hubo un error al leer.");
    }
  };

  // --- BASE DE DATOS (SUPABASE) ---
  const [patients, setPatients] = useState([]);
  const [_loading, setLoading] = useState(false);
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
      alert(`¡Genial! Hemos enviado un correo de invitación a ${newMember.email}.\n\nPor favor, avísale a ${newMember.name} que revise su bandeja de entrada (y Spam) para confirmar su cuenta y crear su contraseña.`);
      navigate(view, { modal: null });
      setNewMember({ name: '', email: '', password: '', role: 'doctor' });

    } catch (error) {
      logger.error("Error creando miembro:", error);
      alert("Error: " + error.message);
    } finally {
      setTeamLoading(false);
    }
  };

  // --- NAVEGACIÓN Y PERSISTENCIA (URL) ---
  const navigate = (newView, params = {}) => {
    setView(newView);

    // Handle modals based on params
    if (params.modal !== undefined) {
      setIsTeamModalOpen(params.modal === 'team');
      setIsDataModalOpen(params.modal === 'data');
    }

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
      const modalParam = params.get('modal');

      setView(viewParam);
      setIsTeamModalOpen(modalParam === 'team');
      setIsDataModalOpen(modalParam === 'data');

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

  const getNowDate = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  // --- DATOS DEL DOCTOR (Para Impresión) ---

  // --- VADEMÉCUM ESTRUCTURADO ---

  // --- DIAGNÓSTICOS ---


  // --- CATÁLOGO CON INDICACIONES Y TRATAMIENTOS (SMART PROTOCOLS) ---



  // --- AGENDA LOGIC ---
  const [showConfirmed, setShowConfirmed] = useState(false); // Toggle for Agenda view
  const [showAgendaImportModal, setShowAgendaImportModal] = useState(false);
  const [agendaImportText, setAgendaImportText] = useState('');

  const handleAgendaImport = async () => {
    if (!agendaImportText.trim()) return;

    // ROBUST PARSER: Handles newlines inside quoted strings (Excel format)
    const parseTSV = (text) => {
      const rows = [];
      let currentRow = [];
      let currentField = '';
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (char === '"') {
          if (inQuotes && nextChar === '"') {
            // Escaped quote ("") -> add single quote
            currentField += '"';
            i++; // Skip next quote
          } else {
            // Toggle quote state
            inQuotes = !inQuotes;
          }
        } else if (char === '\t' && !inQuotes) {
          // Tab delimiter (outside quotes) -> End field
          currentRow.push(currentField);
          currentField = '';
        } else if ((char === '\n' || char === '\r') && !inQuotes) {
          // Newline (outside quotes) -> End row
          // Handle \r\n or just \n
          if (char === '\r' && nextChar === '\n') i++;

          currentRow.push(currentField);
          if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
            rows.push(currentRow);
          }
          currentRow = [];
          currentField = '';
        } else {
          // Regular character
          currentField += char;
        }
      }

      // Push last field/row if exists
      if (currentField || currentRow.length > 0) {
        currentRow.push(currentField);
        rows.push(currentRow);
      }

      return rows;
    };

    const rows = parseTSV(agendaImportText.trim());
    const newAppointments = [];

    for (const cols of rows) {
      if (cols.length < 2) continue; // Relaxed: Only need Date and Time minimum

      try {
        // 1. Parse Date (DD/MM/YYYY -> YYYY-MM-DD)
        const datePart = cols[0]?.trim();
        if (!datePart || !datePart.includes('/')) continue;

        const [d, m, y] = datePart.split('/');
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
        const dob = cols[11]?.trim() || ''; // Fecha Nacimiento (Col 11 in user data?)
        // User data: 18/12/1985 (Col 11)

        const chronic = cols[12]?.trim() || ''; // Enfermedades? No, user data: "No"
        const meds = cols[13]?.trim() || ''; // Medicamentos
        const allergies = cols[14]?.trim() || ''; // Alergias
        const surgeries = cols[15]?.trim() || ''; // Cirugias
        const referral = cols[16]?.trim() || ''; // Referencia (Google)

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
          patient_dob: dob ? parseDate(dob) : '', // Mapped
          referral_source: referral,  // Mapped
          chronic_illnesses: chronic, // Mapped
          medications: meds,          // Mapped
          allergies: allergies,       // Mapped
          surgeries: surgeries,       // Mapped
          patient_reason: reason,     // Mapped (Motivo)
          symptoms: details,
          appointment_date: appointmentDate,
          status: 'pending'
        });

      } catch (e) {
        logger.error("Error parsing line:", cols, e);
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
      logger.error("Error fetching appointments:", error);
    } finally {
      setLoadingAppointments(false);
    }
  };

  // Auto-fetch appointments when entering Agenda v2
  useEffect(() => {
    if (view === 'agenda-v2') {
      fetchAppointments();
    }
  }, [view, user.clinicId]);

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

      if (isEditing) setEditingAppointment(null);

      // No alert needed - visual feedback from state change is enough
    } catch {
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
      const { data, error: _fetchError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', apt.patient_dni)
        .maybeSingle();

      if (data) {
        // If patient exists, we must use their data (especially history/consultations)
        // We restore the structure from the 'data' JSONB column if available
        existingPatient = { ...data.data, id: data.id };
        // logger.log("Found existing patient:", existingPatient);

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

    // CLEAR DRAFT to ensure we start fresh with this patient
    clearDraft();

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
      logger.error("Error al cargar pacientes:", error);
      alert("Error al sincronizar con la nube. Verifique su conexión.");
    } finally {
      setLoading(false);
    }
  };

  // --- TRIAJE LOGIC (DB INTEGRATED) ---
  const [dailyList, setDailyList] = useState([]);
  const [trashedAppointments, setTrashedAppointments] = useState([]);
  const [_listDate, setListDate] = useState(getNowDate().split('T')[0]);
  const [selectedDate, setSelectedDate] = useState(getNowDate().split('T')[0]);

  // Real-time Subscription & Polling for Daily Appointments
  useEffect(() => {
    if (!user?.clinicId) return;

    // 1. Initial Fetch
    fetchDailyAppointments();

    // 2. Real-time Subscription
    const subscription = supabase
      .channel('appointments-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `clinic_id=eq.${user.clinicId}` }, () => {
        // logger.log('Real-time change detected:', payload);
        fetchDailyAppointments();
      })
      .subscribe();

    // 3. Polling (Backup every 5 minutes)
    const intervalId = setInterval(() => {
      // logger.log('Auto-refreshing appointments (5 min)...');
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
      logger.error("Error fetching daily list:", error);
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
      logger.error("Error fetching trashed appointments:", error);
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
      logger.error("Error restoring appointment:", error);
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
      logger.error("Error permanently deleting appointment:", error);
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
      logger.error("Error updating status:", error);
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
      logger.error(`Error updating ${field}:`, error);
      fetchDailyAppointments(); // Revert on error
    }
  };

  const _handleMoveOrder = async (id, direction) => {
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
      logger.error("Error reordering:", error);
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
      const { id: _id, created_at: _created_at, ...rest } = originalApt;

      try {
        const { data: _insertData, error } = await supabase
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
        logger.error("Error duplicating appointment:", error);
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
      logger.error("Error updating time:", error);
      fetchDailyAppointments(); // Revert
      fetchAppointments(); // Revert
    }
  };

  const deleteAppointment = async (id) => {
    const apt = appointments.find(a => a.id === id) || dailyList.find(a => a.id === id);

    if (!apt) return;

    // PROTECCIÓN ESTRICTA: Advertencia si está en Triaje
    const protectedStatuses = ['confirmed', 'arrived', 'attended'];
    if (protectedStatuses.includes(apt.status)) {
      if (!confirm("⚠️ ADVERTENCIA: Esta cita ya está en Triaje (Confirmado/En Sala/Atendido).\n\n¿Seguro que deseas eliminarla? Se moverá a la papelera.")) {
        return;
      }
    }

    // PROTECCIÓN HISTÓRICA: Advertencia si es pasada
    const today = new Date().toISOString().split('T')[0];
    const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];

    if (aptDate < today) {
      if (!confirm("⚠️ ADVERTENCIA: Esta cita es del historial (fecha pasada).\n\n¿Seguro que deseas eliminarla?")) {
        return;
      }
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
      logger.error("Error deleting appointment:", error);
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

    // Identificar citas "peligrosas" (Triaje o Pasadas)
    const dangerousToDelete = appointments.filter(a => {
      if (!selectedAppointments.includes(a.id)) return false;
      const isTriage = protectedStatuses.includes(a.status);
      const isPast = new Date(a.appointment_date).toISOString().split('T')[0] < today;
      return isTriage || isPast;
    });

    // Identificar citas con Ticket (Web)
    const ticketedToDelete = appointments.filter(a => selectedAppointments.includes(a.id) && a.symptoms?.includes('[Ticket: #'));

    if (ticketedToDelete.length > 0) {
      if (!confirm(`⚠️ ADVERTENCIA DE SEGURIDAD\n\nHas seleccionado ${ticketedToDelete.length} citas que tienen TICKET (Solicitud Web).\n\n¿Confirmas que deseas eliminarlas permanentemente?`)) {
        return;
      }
    }

    if (dangerousToDelete.length > 0) {
      if (!confirm(`⚠️ ADVERTENCIA: Has seleccionado ${dangerousToDelete.length} citas que están en Triaje o son del Historial.\n\n¿Estás seguro de que deseas eliminarlas todas?`)) {
        return;
      }
    }

    if (!window.confirm(`¿Estás seguro de eliminar las ${selectedAppointments.length} solicitudes seleccionadas?`)) return;

    const itemsToDelete = selectedAppointments;

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
      logger.error("Error bulk deleting:", error);
      fetchAppointments();
      fetchDailyAppointments();
    }
  };

  const handleTriageBulkDelete = async () => {
    if (selectedTriageItems.length === 0) return;

    // Check for appointments with tickets (web requests)
    const ticketedToDelete = dailyList.filter(a =>
      selectedTriageItems.includes(a.id) && a.symptoms?.includes('[Ticket:')
    );

    if (ticketedToDelete.length > 0) {
      // First confirmation for ticketed items
      if (!window.confirm(`⚠️ ADVERTENCIA\\n\\nHas seleccionado ${ticketedToDelete.length} paciente(s) con TICKET (Solicitud Web/Import).\\n\\n¿Estás seguro de que deseas eliminarlos?`)) {
        return;
      }
      // Second confirmation for extra safety
      if (!window.confirm(`⚠️ SEGUNDA CONFIRMACIÓN\\n\\nEsto eliminará pacientes REALES que agendaron por la web.\\n\\n¿Confirmas la eliminación de ${ticketedToDelete.length} paciente(s)?`)) {
        return;
      }
    }

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
      logger.error("Error deleting triage items:", error);
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

  // Trash bulk actions
  const handleTrashSelectAll = (e, items) => {
    if (e.target.checked) {
      setSelectedTrashItems(items.map(i => i.id));
    } else {
      setSelectedTrashItems([]);
    }
  };

  const handleBulkRestore = async () => {
    if (selectedTrashItems.length === 0) return;
    if (!confirm(`¿Restaurar ${selectedTrashItems.length} ${selectedTrashItems.length === 1 ? 'cita' : 'citas'}?`)) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'pending' })
        .in('id', selectedTrashItems);

      if (error) throw error;

      setSelectedTrashItems([]);
      fetchTrashedAppointments();
      fetchAppointments();
    } catch (error) {
      logger.error("Error restoring appointments:", error);
      alert("Error al restaurar las citas.");
    }
  };

  const handleBulkPermanentDelete = async () => {
    if (selectedTrashItems.length === 0) return;
    if (!confirm(`⚠️ ADVERTENCIA\n\n¿Estás seguro de eliminar PERMANENTEMENTE ${selectedTrashItems.length} ${selectedTrashItems.length === 1 ? 'cita' : 'citas'}?\n\nEsta acción NO se puede deshacer.`)) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .in('id', selectedTrashItems);

      if (error) throw error;

      setSelectedTrashItems([]);
      fetchTrashedAppointments();
    } catch (error) {
      logger.error("Error permanently deleting appointments:", error);
      alert("Error al eliminar las citas.");
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
      logger.error("Error deleting patient:", error);
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

  // Helper for auto-resizing textareas
  const autoResize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  // Effect to auto-resize on data load
  useEffect(() => {
    if (view === 'form') {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const textareas = document.querySelectorAll('textarea.auto-resize');
        textareas.forEach(el => autoResize(el));
      }, 100);
    }
  }, [formData, view]);

  // --- PERSISTENCIA DEL FORMULARIO ---
  // Cargar borrador al iniciar
  useEffect(() => {
    const savedDraft = localStorage.getItem('medical_form_draft');
    if (savedDraft && view === 'form' && isNewPatient) {
      try {
        const parsed = JSON.parse(savedDraft);
        // Solo restaurar si parece válido y tiene datos
        if (parsed && (parsed.nombre || parsed.resumen || parsed.diagnosticos?.length > 0)) {
          logger.log("Restoring draft from localStorage");
          setFormData(parsed);
        }
      } catch (e) {
        console.error("Error parsing draft", e);
      }
    }
  }, [view, isNewPatient]); // Re-run when view changes (e.g. after URL sync)

  // Guardar borrador automáticamente
  useEffect(() => {
    if (view === 'form') {
      const timeoutId = setTimeout(() => {
        localStorage.setItem('medical_form_draft', JSON.stringify(formData));
      }, 500); // Debounce de 500ms
      return () => clearTimeout(timeoutId);
    }
  }, [formData, view]);

  // Limpiar borrador explícitamente
  const clearDraft = () => {
    localStorage.removeItem('medical_form_draft');
  };

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
      logger.error("Error al guardar en Supabase:", error);
      alert("Error al guardar en la nube. Los datos están en local pero podrían perderse si recargas.");
    }
  };
  const openPrescriptionModal = () => {
    setIsPrescriptionOpen(true);
  };

  const handleUpdatePrescription = (newReceta, newIndicaciones) => {
    if (!selectedPatient) return;
    const updatedPatients = patients.map(p => {
      if (p.id === selectedPatient.id) {
        // Clonar para mutar
        const pClone = JSON.parse(JSON.stringify(p));
        if (pClone.consultas && pClone.consultas[selectedConsultationIndex]) {
          pClone.consultas[selectedConsultationIndex].receta = newReceta;
          pClone.consultas[selectedConsultationIndex].indicaciones = newIndicaciones;
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
        logger.error(error);
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
      } catch {
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
  const _renderRecetaTable = (recetaItems) => {
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
      <SidebarNav
        user={user}
        view={view}
        isMobileMenuOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        onNavigate={navigate}
        onNewPatient={() => {
          setIsNewPatient(true);
          setEditingConsultationIndex(null);
          clearDraft();
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
        }}
        onOpenTeamModal={() => navigate(view, { modal: 'team' })}
        onOpenDataModal={() => navigate(view, { modal: 'data' })}
        onLogout={onLogout}
      />

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
              {view === 'config' && 'Configuración'}
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
              {view === 'detail' && 'Historia Clínica Digital'}
              {view === 'triage' && 'Triaje y Lista de Espera'}
              {view === 'config' && 'Configuración del Consultorio'}
            </h1>
          </header>

        </div>

        <div className="p-4 md:p-8">
          {/* VISTA LISTA */}
          {view === 'list' && (
            <PatientListView
              user={user}
              patients={patients}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onOpenDataModal={() => setIsDataModalOpen(true)}
              onExportCSV={exportToCSV}
              onViewHistory={(p) => { setSelectedPatient(p); setSelectedConsultationIndex(0); navigate('detail', { patientId: p.id }); }}
              onDeletePatient={deletePatient}
            />
          )}

          {/* VISTA TRIAJE */}
          {view === 'triage' && (
            <TriageView
              user={user}
              dailyList={dailyList}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              fetchDailyAppointments={fetchDailyAppointments}
              selectedTriageItems={selectedTriageItems}
              onSelectTriageItems={setSelectedTriageItems}
              onTriageBulkDelete={handleTriageBulkDelete}
              onTriageSelectAll={handleTriageSelectAll}
              editingAppointment={editingAppointment}
              setEditingAppointment={setEditingAppointment}
              onSaveTime={handleSaveTime}
              onUpdateAppointmentField={updateAppointmentField}
              onUpdateTriageStatus={updateTriageStatus}
              onConvertToPatient={handleConvertToPatient}
            />
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

                {/* Bulk Actions Bar */}
                {selectedTrashItems.length > 0 && (
                  <div className="p-4 bg-blue-50 border-b flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-900">
                      {selectedTrashItems.length} {selectedTrashItems.length === 1 ? 'cita seleccionada' : 'citas seleccionadas'}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleBulkRestore}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-green-700 flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Restaurar Seleccionadas
                      </button>
                      <button
                        onClick={handleBulkPermanentDelete}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar Permanentemente
                      </button>
                    </div>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b">
                      <tr>
                        <th className="p-4 w-12">
                          <input
                            type="checkbox"
                            onChange={(e) => handleTrashSelectAll(e, trashedAppointments)}
                            checked={trashedAppointments.length > 0 && selectedTrashItems.length === trashedAppointments.length}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                        </th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Fecha Cita</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Paciente</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Motivo</th>
                        <th className="text-left p-4 text-sm font-bold text-slate-600">Eliminado</th>
                        <th className="text-center p-4 text-sm font-bold text-slate-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trashedAppointments.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-gray-400">No hay citas en la papelera.</td></tr>}
                      {trashedAppointments.map((apt, index) => {
                        // Group header by date
                        const showDateHeader = index === 0 ||
                          (apt.deleted_at && trashedAppointments[index - 1]?.deleted_at &&
                            new Date(apt.deleted_at).toLocaleDateString() !== new Date(trashedAppointments[index - 1].deleted_at).toLocaleDateString());

                        return (
                          <React.Fragment key={apt.id}>
                            {showDateHeader && apt.deleted_at && (
                              <tr className="bg-slate-100">
                                <td colSpan="6" className="p-3 text-sm font-bold text-slate-700">
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
                                <input
                                  type="checkbox"
                                  checked={selectedTrashItems.includes(apt.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedTrashItems([...selectedTrashItems, apt.id]);
                                    } else {
                                      setSelectedTrashItems(selectedTrashItems.filter(id => id !== apt.id));
                                    }
                                  }}
                                  className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                />
                              </td>
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

          {/* VISTA CONFIGURACIÓN */}
          {view === 'config' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="bg-blue-50 p-3 rounded-full">
                    <Settings className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Horarios de Atención</h2>
                    <p className="text-sm text-slate-500">Configura los días y horas disponibles para citas online.</p>
                  </div>
                </div>

                <ConfiguracionHorarios clinicId={user.clinicId} />
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
                        <div>
                          <label className="text-xs font-bold text-red-600">Alergias</label>
                          <textarea
                            name="alergias"
                            value={formData.alergias}
                            onChange={(e) => { handleChange(e); autoResize(e.target); }}
                            rows={1}
                            className="w-full border p-1 rounded text-sm border-red-200 auto-resize overflow-hidden resize-none"
                            placeholder="Ninguna"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold">Enfermedades</label>
                          <textarea
                            name="enfermedades"
                            value={formData.enfermedades}
                            onChange={(e) => { handleChange(e); autoResize(e.target); }}
                            rows={1}
                            className="w-full border p-1 rounded text-sm auto-resize overflow-hidden resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold">Medicamentos Uso</label>
                          <textarea
                            name="medicamentos"
                            value={formData.medicamentos}
                            onChange={(e) => { handleChange(e); autoResize(e.target); }}
                            rows={1}
                            className="w-full border p-1 rounded text-sm auto-resize overflow-hidden resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold">Cirugías</label>
                          <textarea
                            name="cirugias"
                            value={formData.cirugias}
                            onChange={(e) => { handleChange(e); autoResize(e.target); }}
                            rows={1}
                            className="w-full border p-1 rounded text-sm auto-resize overflow-hidden resize-none"
                          />
                        </div>
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
            <PatientHistoryView
              patient={selectedPatient}
              selectedConsultationIndex={selectedConsultationIndex}
              onSelectConsultation={setSelectedConsultationIndex}
              onNewConsultation={prepareFormForNewConsultation}
              onBack={() => navigate('list')}
              onOpenPrescription={openPrescriptionModal}
              onEditConsultation={handleEditConsultation}
            />
          )}

          {/* MODAL RECETA A5 (EDITABLE Y PARA IMPRIMIR) */}
          <PrescriptionModal
            isOpen={isPrescriptionOpen}
            onClose={() => setIsPrescriptionOpen(false)}
            patient={selectedPatient}
            consultation={getDisplayConsultation()}
            doctorInfo={DOCTOR_INFO}
            onSave={handleUpdatePrescription}
            onSaveAndFinish={saveConsultation}
          />

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

          {/* MODAL GESTIÓN DE DATOS */}
          <DataManagementModal
            isOpen={isDataModalOpen}
            onClose={() => navigate(view, { modal: null })}
            user={user}
            onExportJSON={exportToJSON}
            onSaveToFolder={saveToFolder}
            onConnectFolder={handleConnectFolder}
            directoryHandle={directoryHandle}
            importMode={importMode}
            onSetImportMode={setImportMode}
            onRestoreBackup={handleRestoreBackupFile}
            importPreview={importPreview}
            onSetImportPreview={setImportPreview}
            onPreviewExcel={handlePreviewExcel}
            onProcessImport={processImport}
            onOpenPasteModal={() => { navigate(view, { modal: null }); setIsPasteModalOpen(true); }}
          />
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
                                        if (error) { logger.error(error); fetchAppointments(); }
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
                                        if (error) { logger.error(error); fetchAppointments(); }
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
              <AgendaView
                user={user}
                appointments={appointments}
                setAppointments={setAppointments}
                selectedAppointments={selectedAppointments}
                showConfirmed={showConfirmed}
                showAgendaImportModal={showAgendaImportModal}
                setShowAgendaImportModal={setShowAgendaImportModal}
                agendaImportText={agendaImportText}
                setAgendaImportText={setAgendaImportText}
                fetchAppointments={fetchAppointments}
                handleBulkDelete={handleBulkDelete}
                handleSelectAll={handleSelectAll}
                handleSelectAppointment={handleSelectAppointment}
                confirmAppointment={confirmAppointment}
                deleteAppointment={deleteAppointment}
                handleAgendaImport={handleAgendaImport}
                supabase={supabase}
                logger={logger}
              />
            )
          }

          {/* MODAL EQUIPO */}
          <TeamModal
            isOpen={isTeamModalOpen}
            onClose={() => navigate(view, { modal: null })}
            newMember={newMember}
            onNewMemberChange={setNewMember}
            onSubmit={handleCreateTeamMember}
            isLoading={teamLoading}
          />

          {/* MODAL IMPORTACIÓN AGENDA */}
          <AgendaImportModal
            isOpen={isAgendaImportOpen}
            onClose={() => setIsAgendaImportOpen(false)}
            pasteText={agendaPasteText}
            onPasteTextChange={setAgendaPasteText}
            onImport={handleAgendaImport}
          />
        </div>
      </main>

    </div>
  );
}