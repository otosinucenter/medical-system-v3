import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { Calendar, User, Phone, FileText, CheckCircle, AlertCircle, Clock, MapPin, Mail, Activity, Pill, Scissors, HelpCircle, Globe } from 'lucide-react';

// Cliente Supabase temporal (público)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const COUNTRIES = [
    "Perú", "Chile", "Colombia", "México", "Argentina", "España", "Estados Unidos", "Ecuador", "Bolivia", "Venezuela", "Otro"
];

export default function PublicAppointmentForm() {
    const { clinicId } = useParams();
    const [formData, setFormData] = useState({
        // Cita
        date: '',
        time: '',
        symptoms: '',
        // Datos Personales
        dni: '',
        name: '',
        age: '',
        ageUnit: 'Años', // Nuevo: Años o Meses
        sex: '',
        occupation: '',
        country: 'Perú', // Nuevo: País
        district: '',
        phone: '',
        email: '',
        dob: '',
        // Antecedentes
        chronic_illnesses: '',
        medications: '',
        allergies: '',
        surgeries: '',
        // Referencia
        referral_source: [],
        referral_detail: ''
    });

    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [clinicName, setClinicName] = useState('');

    useEffect(() => {
        const fetchClinic = async () => {
            if (!clinicId) return;
            const { data, error: _fetchError } = await supabase
                .from('clinics')
                .select('name')
                .eq('id', clinicId)
                .single();

            if (data) setClinicName(data.name);
        };
        fetchClinic();
    }, [clinicId]);

    const handleCheckboxChange = (value) => {
        const current = formData.referral_source;
        if (current.includes(value)) {
            setFormData({ ...formData, referral_source: current.filter(item => item !== value) });
        } else {
            setFormData({ ...formData, referral_source: [...current, value] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!clinicId) throw new Error("Link inválido. Falta el ID del consultorio.");

            // Combinar fecha y hora
            const appointmentDate = new Date(`${formData.date}T${formData.time}`);

            const { error: insertError } = await supabase
                .from('appointments')
                .insert([{
                    clinic_id: clinicId,
                    patient_name: formData.name,
                    patient_phone: formData.phone,
                    symptoms: formData.symptoms,
                    appointment_date: appointmentDate.toISOString(),
                    status: 'pending',
                    // Nuevos campos
                    patient_dni: formData.dni,
                    patient_age: `${formData.age} ${formData.ageUnit}`, // Guardamos edad con unidad
                    patient_sex: formData.sex,
                    patient_occupation: formData.occupation,
                    patient_district: `${formData.country} - ${formData.district}`, // Guardamos País - Distrito
                    patient_email: formData.email,
                    patient_dob: formData.dob,
                    chronic_illnesses: formData.chronic_illnesses,
                    medications: formData.medications,
                    allergies: formData.allergies,
                    surgeries: formData.surgeries,
                    referral_source: formData.referral_source.join(', '),
                    referral_detail: formData.referral_detail
                }]);

            if (insertError) throw insertError;

            setSubmitted(true);
        } catch (err) {
            console.error("Error al agendar:", err);
            setError("Hubo un problema al enviar tu solicitud. Por favor intenta de nuevo.");
        } finally {
            setLoading(false);
        }
    };

    const calculateDobFromAge = (age, unit) => {
        if (!age) return '';
        const today = new Date();
        let birthDate = new Date();

        if (unit === 'Años') {
            birthDate.setFullYear(today.getFullYear() - parseInt(age));
        } else {
            birthDate.setMonth(today.getMonth() - parseInt(age));
        }

        // Return YYYY-MM-DD
        return birthDate.toISOString().split('T')[0];
    };

    const handleAgeChange = (val, unit) => {
        const newDob = calculateDobFromAge(val, unit);
        setFormData({ ...formData, age: val, ageUnit: unit, dob: newDob });
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Solicitud Enviada!</h2>
                    <p className="text-slate-600 mb-6">
                        Hemos recibido tus datos correctamente. El consultorio {clinicName && <strong>{clinicName}</strong>} se pondrá en contacto contigo pronto para confirmar tu cita.
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="text-blue-600 font-medium hover:underline"
                    >
                        Enviar otra solicitud
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-blue-600 p-6 text-center">
                    <h1 className="text-2xl font-bold text-white">Solicitud de Agenda de Cita</h1>
                    <p className="text-blue-100 mt-2 text-sm px-4">
                        El presente es para ser llenado previa a la cita, el objetivo es tener información organizada y detallada previa a su evaluación.
                    </p>
                    <p className="text-white font-medium mt-1">Consultorio Dr. Walter Florez Guerra</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            {error}
                        </div>
                    )}

                    {/* SECCIÓN 1: CITA */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Datos de la Cita
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Propuesta</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Hora Propuesta</label>
                                <input
                                    type="time"
                                    required
                                    className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                    value={formData.time}
                                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumen de Enfermedad / Síntomas</label>
                            <textarea required rows={3} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Describa brevemente sus síntomas actuales..." value={formData.symptoms} onChange={e => setFormData({ ...formData, symptoms: e.target.value })} />
                        </div>
                    </section>

                    {/* SECCIÓN 2: DATOS PERSONALES */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Datos Personales
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">DNI / Documento <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.dni} onChange={e => setFormData({ ...formData, dni: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Nombre y Apellido <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>

                            {/* EDAD CON SELECTOR DE UNIDAD */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Edad <span className="text-red-500">*</span></label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        required
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.age}
                                        onChange={e => handleAgeChange(e.target.value, formData.ageUnit)}
                                    />
                                    <select
                                        className="p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                        value={formData.ageUnit}
                                        onChange={e => handleAgeChange(formData.age, e.target.value)}
                                    >
                                        <option value="Años">Años</option>
                                        <option value="Meses">Meses</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Nacimiento (Aprox)</label>
                                <input type="date" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-slate-100" value={formData.dob} readOnly />
                                <p className="text-xs text-slate-500 mt-1">Calculada automáticamente según edad.</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sexo</label>
                            <div className="flex gap-4 mt-1">
                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 w-full justify-center">
                                    <input type="radio" name="sex" value="Femenino" checked={formData.sex === 'Femenino'} onChange={e => setFormData({ ...formData, sex: e.target.value })} />
                                    <span>Femenino</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50 w-full justify-center">
                                    <input type="radio" name="sex" value="Masculino" checked={formData.sex === 'Masculino'} onChange={e => setFormData({ ...formData, sex: e.target.value })} />
                                    <span>Masculino</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ocupación <span className="text-red-500">*</span></label>
                                <input type="text" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.occupation} onChange={e => setFormData({ ...formData, occupation: e.target.value })} />
                                <p className="text-xs text-slate-500 mt-1">
                                    Importante para determinar si tiene exposición a sonidos fuertes, aire acondicionado o hace uso exagerado de la voz.
                                </p>
                            </div>

                            {/* PROCEDENCIA CON PAÍS */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Procedencia <span className="text-red-500">*</span></label>
                                <div className="space-y-2">
                                    <select
                                        className="w-full p-3 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
                                        value={formData.country}
                                        onChange={e => setFormData({ ...formData, country: e.target.value })}
                                    >
                                        {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ciudad / Distrito"
                                        className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        value={formData.district}
                                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-1">
                                    ¿Dónde estuvo los últimos 3 meses? Importante para determinar clima, contaminación o polvo.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Celular / WhatsApp <span className="text-red-500">*</span></label>
                                <input type="tel" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                                <input type="email" required className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                            </div>
                        </div>
                    </section>

                    {/* SECCIÓN 3: ANTECEDENTES MÉDICOS */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-600" />
                            Antecedentes Médicos
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Enfermedades Crónicas</label>
                            <textarea rows={2} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Ej: Hipertensión, diabetes, asma, cáncer..." value={formData.chronic_illnesses} onChange={e => setFormData({ ...formData, chronic_illnesses: e.target.value })} />
                            <p className="text-xs text-slate-500 mt-1">
                                ¿Padece alguna enfermedad crónica? Especifique si es hipertensión, diabetes, asma, cáncer u otra.
                            </p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Medicamentos usados frecuentemente</label>
                            <textarea rows={2} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.medications} onChange={e => setFormData({ ...formData, medications: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Alergias a medicamentos</label>
                            <textarea rows={2} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.allergies} onChange={e => setFormData({ ...formData, allergies: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cirugías en Cabeza y/o Cuello</label>
                            <textarea rows={2} className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" value={formData.surgeries} onChange={e => setFormData({ ...formData, surgeries: e.target.value })} />
                        </div>
                    </section>

                    {/* SECCIÓN 4: REFERENCIA */}
                    <section className="space-y-4">
                        <h3 className="text-lg font-bold text-slate-800 border-b pb-2 flex items-center gap-2">
                            <HelpCircle className="w-5 h-5 text-blue-600" />
                            Información Adicional
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">¿Cómo nos encontró?</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Google', 'Doctoralia', 'Facebook', 'Instagram', 'Recomendación', 'Grupo de Whatsapp', 'IA (ChatGPT, etc)'].map(opt => (
                                    <label key={opt} className="flex items-center gap-2 cursor-pointer p-2 border rounded-lg hover:bg-slate-50">
                                        <input
                                            type="checkbox"
                                            checked={formData.referral_source.includes(opt)}
                                            onChange={() => handleCheckboxChange(opt)}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                        />
                                        <span className="text-sm">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Si fue recomendado, ¿por quién?</label>
                            <input type="text" className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Nombre del médico o paciente" value={formData.referral_detail} onChange={e => setFormData({ ...formData, referral_detail: e.target.value })} />
                        </div>
                    </section>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all transform hover:scale-[1.01]"
                    >
                        {loading ? 'Enviando Solicitud...' : 'Confirmar y Enviar Solicitud'}
                    </button>
                </form>
            </div>
        </div>
    );
}
