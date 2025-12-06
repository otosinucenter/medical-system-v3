import React, { useState, useMemo } from 'react';
import { User, Calendar, Clipboard, Stethoscope, ListPlus, Pill, Search, Plus, Trash2, ChevronRight, Activity, Save, Printer } from 'lucide-react';

const ConsultationFormV2 = ({
    formData,
    handleChange,
    handleSubmit,
    isNewPatient,
    user,
    autoResize,
    // Props para lógica existente
    addExamTemplate,
    EXAM_TEMPLATES,
    DIAGNOSTICOS_COMUNES,
    CATALOGO_MEDICO,
    selectCommonDiagnosis,
    selectProtocol,
    diagInput,
    setDiagInput,
    addManualDiagnosis,
    removeDiagnosis,
    getFilteredVademecum,
    addMedicationRow,
    updateMedicationRow,
    removeMedicationRow,
    // Props para servicios
    selectedServices,
    setSelectedServices,
    updateAppointmentServices,
    SERVICIOS_MEDICOS,
    // Props para guardar
    onSave,
    onSaveAndFinish,
    // Navegación
    onBack
}) => {
    const [activeTab, setActiveTab] = useState('oido');
    const [diagSearch, setDiagSearch] = useState('');
    const [showDiagSuggestions, setShowDiagSuggestions] = useState(false);

    // Lógica Autocompletado de Diagnósticos
    const filteredDiagnoses = useMemo(() => {
        if (!diagSearch) return [];
        const term = diagSearch.toUpperCase();
        const results = [];
        Object.keys(CATALOGO_MEDICO).forEach(cat => {
            CATALOGO_MEDICO[cat].forEach(d => {
                if (d.label.toUpperCase().includes(term) || d.cie10.includes(term)) {
                    results.push({ ...d, category: cat });
                }
            });
        });
        return results.slice(0, 10);
    }, [diagSearch, CATALOGO_MEDICO]);

    const handleDiagSelect = (item) => {
        setDiagInput({ code: item.cie10, desc: item.label });
        setDiagSearch('');
        setShowDiagSuggestions(false);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 pb-20">
            {/* Header Fijo */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
                <div>
                    <h1 className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                        {isNewPatient ? 'Nueva Consulta' : 'Historia Clínica'}
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Dr. Walter Florez Guerra</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={onBack} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={onSave} className="px-5 py-2 rounded-lg bg-emerald-500 text-white font-bold text-sm shadow-md hover:bg-emerald-600 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" /> Guardar
                    </button>
                    <button onClick={onSaveAndFinish} className="px-5 py-2 rounded-lg bg-blue-600 text-white font-bold text-sm shadow-md hover:bg-blue-700 transition-all flex items-center gap-2">
                        <Printer className="w-4 h-4" /> Finalizar e Imprimir
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-12 gap-8">

                {/* COLUMNA IZQUIERDA: Contexto del Paciente (Sticky) */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="sticky top-24 space-y-4">
                        {/* Tarjeta Paciente */}
                        <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-50/50 relative overflow-hidden group hover:shadow-xl transition-shadow">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                            <div className="flex flex-col items-center">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-indigo-50 flex items-center justify-center mb-3 shadow-inner border-2 border-white">
                                    <User className="w-8 h-8 text-blue-500" />
                                </div>
                                <h2 className="text-lg font-bold text-gray-800 text-center leading-tight mb-1">{formData.nombre || "Nuevo Paciente"}</h2>
                                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                                    {formData.edad || "--"} años
                                </span>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Activity className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium">{formData.id || "Sin DNI"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                    <Calendar className="w-4 h-4 text-blue-400" />
                                    <span className="font-medium">{new Date(formData.fechaCita || new Date()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>

                        {/* Resumen Antecedentes (Solo visualización rápida) */}
                        <div className="bg-white/60 backdrop-blur rounded-xl p-4 border border-gray-100 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Resumen Rápido</h4>
                            <div className="flex flex-wrap gap-1">
                                {formData.alergias && <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] rounded border border-red-100 font-medium">Alergias</span>}
                                {formData.enfermedades && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 text-[10px] rounded border border-yellow-100 font-medium">Enfermedades</span>}
                            </div>
                        </div>
                    </div>
                </div>

                {/* COLUMNA DERECHA: Formulario Clínico */}
                <div className="col-span-12 lg:col-span-9 space-y-6">

                    {/* SECCIÓN 1: DATOS GENERALES (Expandible) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><User className="w-4 h-4" /></div>
                            <h3 className="font-bold text-gray-700">Filiación y Contacto</h3>
                        </div>
                        <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {/* Campos existentes mapeados al nuevo diseño */}
                            <div className="col-span-2 md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Nombre Completo</label>
                                <input required name="nombre" value={formData.nombre} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="Nombre del paciente" readOnly={!isNewPatient} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">DNI</label>
                                <input name="id" value={formData.id} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="DNI" readOnly={!isNewPatient} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Celular</label>
                                <input name="celular" value={formData.celular} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" placeholder="Número" />
                            </div>
                            {/* Resto de campos con el mismo estilo... */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Edad</label>
                                <input name="edad" value={formData.edad} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 ml-1">Ocupación</label>
                                <input name="ocupacion" value={formData.ocupacion} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: MOTIVO Y ANTECEDENTES (Diseño 2 columnas) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Motivo de Consulta */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
                            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg"><Clipboard className="w-4 h-4" /></div>
                                <h3 className="font-bold text-gray-700">Motivo de Consulta</h3>
                            </div>
                            <div className="p-4 flex-1">
                                <textarea
                                    name="resumen"
                                    value={formData.resumen}
                                    onChange={handleChange}
                                    rows={5}
                                    className="w-full h-full min-h-[120px] bg-emerald-50/30 border border-emerald-100 rounded-xl p-3 text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-emerald-100 transition-all outline-none resize-none leading-relaxed"
                                    placeholder="Relato del paciente..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Antecedentes (Card Compacta) */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
                                <div className="p-1.5 bg-amber-100 text-amber-600 rounded-lg"><Activity className="w-4 h-4" /></div>
                                <h3 className="font-bold text-gray-700">Antecedentes</h3>
                            </div>
                            <div className="p-4 space-y-3">
                                <div>
                                    <label className="text-xs font-bold text-red-500 ml-1 mb-1 block">Alergias</label>
                                    <input name="alergias" value={formData.alergias} onChange={handleChange} className="w-full bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:bg-white outline-none" placeholder="Niega" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Enfermedades</label>
                                    <input name="enfermedades" value={formData.enfermedades} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:bg-white outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 ml-1 mb-1 block">Medicamentos</label>
                                    <input name="medicamentos" value={formData.medicamentos} onChange={handleChange} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:bg-white outline-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: EXAMEN FÍSICO (Tabs Visuales) */}
                    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                        <div className="p-4 bg-gray-800 text-white flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="w-5 h-5 text-blue-400" />
                                <h3 className="font-bold">Examen Físico</h3>
                            </div>
                            {/* Tabs Selector */}
                            <div className="flex bg-gray-700/50 p-1 rounded-lg">
                                {['oido', 'nariz', 'garganta'].map(part => (
                                    <button
                                        key={part}
                                        onClick={() => setActiveTab(part)}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all ${activeTab === part ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        {part}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 bg-gradient-to-b from-gray-50 to-white">
                            {/* Contenido Dinámico de Tabs */}
                            {['oido', 'nariz', 'garganta'].map(part => (
                                <div key={part} className={activeTab === part ? 'block' : 'hidden'}>
                                    <div className="mb-3 flex flex-wrap gap-2">
                                        {EXAM_TEMPLATES[part].map((t, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => addExamTemplate('examen' + part.charAt(0).toUpperCase() + part.slice(1), t.text)}
                                                className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-medium rounded-full hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm"
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                    <textarea
                                        name={'examen' + part.charAt(0).toUpperCase() + part.slice(1)}
                                        value={formData['examen' + part.charAt(0).toUpperCase() + part.slice(1)]}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full bg-white border border-gray-200 rounded-xl p-4 text-sm text-gray-700 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 outline-none shadow-inner resize-none"
                                        placeholder={`Hallazgos en ${part}...`}
                                    ></textarea>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* SECCIÓN 4: DIAGNÓSTICO (Autocomplete Inteligente) */}
                    <div className="bg-white rounded-2xl shadow-md border border-indigo-50 overflow-hidden relative z-20">
                        <div className="p-4 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg"><ListPlus className="w-4 h-4" /></div>
                                <h3 className="font-bold text-indigo-900">Diagnóstico</h3>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="flex gap-4 mb-4">
                                <div className="relative flex-1">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Search className="h-4 w-4 text-indigo-400" />
                                    </div>
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                        placeholder="Buscar diagnóstico (CIE10 o nombre)..."
                                        value={diagSearch}
                                        onChange={(e) => { setDiagSearch(e.target.value); setShowDiagSuggestions(true); }}
                                        onFocus={() => setShowDiagSuggestions(true)}
                                    />

                                    {/* DROP DOWN AUTOCOMPLETE */}
                                    {showDiagSuggestions && filteredDiagnoses.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-gray-100 max-h-60 overflow-y-auto z-50">
                                            {filteredDiagnoses.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => handleDiagSelect(item)}
                                                    className="w-full text-left px-4 py-2.5 hover:bg-indigo-50 flex items-center justify-between border-b border-gray-50 last:border-0 group"
                                                >
                                                    <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-800">{item.label}</span>
                                                    <span className="text-xs font-bold text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-100">{item.cie10}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Campos Manuales y Botón Agregar */}
                                <div className="w-32">
                                    <input value={diagInput.code} onChange={e => setDiagInput({ ...diagInput, code: e.target.value.toUpperCase() })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-center text-indigo-700 bg-indigo-50/30" placeholder="CIE10" />
                                </div>
                                <button type="button" onClick={addManualDiagnosis} className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Lista de Diagnósticos Agregados */}
                            <div className="space-y-2">
                                {formData.diagnosticos.map((d, i) => (
                                    <div key={i} className="flex justify-between items-center bg-white border border-gray-100 p-3 rounded-xl shadow-sm hover:border-indigo-200 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <span className="w-16 text-xs font-black text-indigo-500 bg-indigo-50 py-1 px-2 rounded text-center">{d.code}</span>
                                            <span className="text-sm font-medium text-gray-700">{d.desc}</span>
                                        </div>
                                        <button type="button" onClick={() => removeDiagnosis(i)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                                {formData.diagnosticos.length === 0 && (
                                    <div className="text-center py-8 text-gray-400 text-sm border-2 border-dashed border-gray-100 rounded-xl">
                                        No hay diagnósticos agregados aún
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 5: TRATAMIENTO (Tabla Moderna) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg"><Pill className="w-4 h-4" /></div>
                                <h3 className="font-bold text-gray-700">Tratamiento</h3>
                            </div>

                            {/* Vademécum Rápido */}
                            <div className="flex gap-2 text-xs">
                                <span className="text-gray-400 py-1">Sugeridos:</span>
                                <div className="flex gap-1">
                                    {getFilteredVademecum().slice(0, 3).map((m, i) => (
                                        <button key={i} type="button" onClick={() => addMedicationRow(m)} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 font-medium transition-colors">
                                            {m.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-0">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-bold tracking-wider">
                                    <tr>
                                        <th className="text-left px-6 py-3">Medicamento</th>
                                        <th className="text-left px-2 py-3 w-20">Cant.</th>
                                        <th className="text-left px-4 py-3">Indicaciones</th>
                                        <th className="text-left px-2 py-3 w-24">Vía</th>
                                        <th className="text-left px-2 py-3 w-24">Días</th>
                                        <th className="px-4 py-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {formData.receta.map((row, idx) => (
                                        <tr key={idx} className="group hover:bg-blue-50/30 transition-colors">
                                            <td className="px-4 py-2"><input className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-300 focus:ring-0 text-sm font-medium text-gray-800 placeholder-gray-300" placeholder="Nombre..." value={row.med} onChange={(e) => updateMedicationRow(idx, 'med', e.target.value)} /></td>
                                            <td className="px-2 py-2"><input className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-300 focus:ring-0 text-sm text-center" value={row.cant} onChange={(e) => updateMedicationRow(idx, 'cant', e.target.value)} /></td>
                                            <td className="px-4 py-2"><input className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-300 focus:ring-0 text-sm" placeholder="Indicaciones..." value={row.ind} onChange={(e) => updateMedicationRow(idx, 'ind', e.target.value)} /></td>
                                            <td className="px-2 py-2"><input className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-300 focus:ring-0 text-sm text-center" value={row.via} onChange={(e) => updateMedicationRow(idx, 'via', e.target.value)} /></td>
                                            <td className="px-2 py-2"><input className="w-full bg-transparent border-0 border-b border-transparent focus:border-blue-300 focus:ring-0 text-sm text-center" value={row.dur} onChange={(e) => updateMedicationRow(idx, 'dur', e.target.value)} /></td>
                                            <td className="px-4 py-2 text-center">
                                                <button type="button" onClick={() => removeMedicationRow(idx)} className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {/* Fila fantasma para agregar fácil (Opcional, o botón) */}
                                    <tr className="bg-gray-50/50">
                                        <td colSpan="6" className="px-6 py-3 text-center">
                                            <button type="button" onClick={() => addMedicationRow({ med: '', cant: '', ind: '', via: '', dur: '' })} className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1 mx-auto">
                                                <Plus className="w-3 h-3" /> Agregar línea vacía
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* SECTION SERVICIOS */}
                    <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                        <div className="p-4 bg-emerald-50/30 flex items-center justify-between border-b border-emerald-100">
                            <h4 className="font-bold text-emerald-800 flex items-center gap-2">💰 Servicios a Cobrar</h4>
                            <span className="text-xl font-black text-emerald-600">S/ {selectedServices.reduce((sum, s) => sum + (s.precioAcordado || 0), 0)}</span>
                        </div>
                        <div className="p-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                            {SERVICIOS_MEDICOS.map(servicio => {
                                const isSelected = selectedServices.some(s => s.id === servicio.id);
                                return (
                                    <label key={servicio.id} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50 shadow-sm' : 'border-gray-200 hover:border-emerald-200 hover:bg-gray-50'}`}>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={(e) => {
                                                let newServices;
                                                if (e.target.checked) {
                                                    newServices = [...selectedServices, { id: servicio.id, nombre: servicio.nombre, precioAcordado: servicio.precioBase }];
                                                } else {
                                                    newServices = selectedServices.filter(s => s.id !== servicio.id);
                                                }
                                                setSelectedServices(newServices);
                                                updateAppointmentServices(newServices);
                                            }}
                                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 mr-3"
                                        />
                                        <span className={`font-semibold text-sm ${isSelected ? 'text-emerald-900' : 'text-gray-600'}`}>{servicio.nombre}</span>
                                    </label>
                                )
                            })}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ConsultationFormV2;
