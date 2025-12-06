import React from 'react';
import { Stethoscope, Check, Shield, Globe, Users, ArrowRight, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-white font-sans text-slate-900">
            {/* Navbar */}
            <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-2 rounded-lg flex items-center justify-center">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-slate-900">DrListo</span>
                        </div>
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-slate-600 hover:text-blue-600 font-medium">Características</a>
                            <a href="#pricing" className="text-slate-600 hover:text-blue-600 font-medium">Precios</a>
                            <Link
                                to="/app"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full font-semibold transition-all shadow-lg shadow-blue-600/20"
                            >
                                Ingresar
                            </Link>
                        </div>

                        {/* Botón Móvil */}
                        <div className="md:hidden">
                            <Link
                                to="/app"
                                className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-md"
                            >
                                Ingresar
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full font-medium text-sm mb-8">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                    </span>
                    Nuevo: Modo Equipo para Clínicas
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
                    Tu Consultorio Médico <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                        En la Nube
                    </span>
                </h1>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
                    Gestiona pacientes, imprime recetas A5 y colabora con tu equipo desde cualquier lugar.
                    Seguro, rápido y diseñado para médicos modernos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/app"
                        className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-lg px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/30 hover:-translate-y-1"
                    >
                        Probar Gratis
                        <ArrowRight className="w-5 h-5" />
                    </Link>
                    <a
                        href="#demo"
                        className="inline-flex items-center justify-center gap-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 text-lg px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Ver Demo
                    </a>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-20 bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-900 mb-4">Todo lo que necesitas</h2>
                        <p className="text-slate-600 max-w-2xl mx-auto">
                            Olvídate del papel y los Excel complicados. DrListo está optimizado para tu flujo de trabajo diario.
                        </p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Globe className="w-8 h-8 text-blue-600" />,
                                title: "Acceso Global",
                                desc: "Accede a tus historias clínicas desde tu consultorio, casa o celular. Tus datos siempre contigo."
                            },
                            {
                                icon: <Users className="w-8 h-8 text-blue-600" />,
                                title: "Modo Equipo",
                                desc: "Invita a tu secretaria o asistentes. Todos trabajan sincronizados en el mismo consultorio."
                            },
                            {
                                icon: <Shield className="w-8 h-8 text-blue-600" />,
                                title: "Seguridad Total",
                                desc: "Encriptación de grado bancario y copias de seguridad automáticas. Tus pacientes están seguros."
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Planes Simples</h2>
                    <p className="text-slate-600">Elige el plan perfecto para tu consultorio.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Plan Básico */}
                    <div className="bg-white p-8 rounded-3xl border border-slate-200 relative overflow-hidden flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Básico</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-6">S/ 0 <span className="text-lg font-normal text-slate-500">/mes</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                1 Médico
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                Hasta 50 Pacientes
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                                Recetas Digitales
                            </li>
                        </ul>
                        <Link to="/app" className="block w-full py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl text-center transition-colors">
                            Comenzar Gratis
                        </Link>
                    </div>

                    {/* Plan Profesional */}
                    <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 relative overflow-hidden text-white shadow-2xl flex flex-col transform md:-translate-y-4">
                        <div className="absolute top-0 right-0 bg-blue-600 text-xs font-bold px-3 py-1 rounded-bl-xl">POPULAR</div>
                        <h3 className="text-xl font-bold mb-2">Profesional</h3>
                        <div className="text-4xl font-extrabold mb-6">S/ 89 <span className="text-lg font-normal text-slate-400">/mes</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                Médicos Ilimitados
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                Pacientes Ilimitados
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                Modo Equipo (Secretaria)
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-blue-400 flex-shrink-0" />
                                Recordatorios WhatsApp (Pronto)
                            </li>
                        </ul>
                        <Link to="/app" className="block w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-center transition-colors shadow-lg shadow-blue-900/50">
                            Prueba de 14 días
                        </Link>
                    </div>

                    {/* Plan Clínica */}
                    <div className="bg-white p-8 rounded-3xl border border-blue-100 relative overflow-hidden flex flex-col">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Clínica</h3>
                        <div className="text-4xl font-extrabold text-slate-900 mb-6">S/ 199 <span className="text-lg font-normal text-slate-500">/mes</span></div>
                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                Todo lo del Profesional
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                Soporte Prioritario 24/7
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                Reportes Avanzados
                            </li>
                            <li className="flex items-center gap-3 text-slate-600">
                                <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                Migración de Datos Gratis
                            </li>
                        </ul>
                        <Link to="/app" className="block w-full py-3 px-6 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold rounded-xl text-center transition-colors">
                            Contactar Ventas
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-50 py-12 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p className="mb-4">&copy; {new Date().getFullYear()} DrListo. Todos los derechos reservados.</p>
                    <div className="flex justify-center gap-6">
                        <a href="#" className="hover:text-slate-900">Términos</a>
                        <a href="#" className="hover:text-slate-900">Privacidad</a>
                        <a href="#" className="hover:text-slate-900">Contacto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
