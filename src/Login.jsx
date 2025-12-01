import React, { useState, useEffect } from 'react';
import { User, Lock, Stethoscope, Calendar, Building } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin'); // Default role for registration
  const [clinicCode, setClinicCode] = useState(''); // Nuevo: Código de invitación
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const inviteCode = params.get('invite');
    if (inviteCode) {
      setIsLogin(false);
      setRole('doctor');
      setClinicCode(inviteCode);
    }
  }, []);

  const getEmail = (user) => {
    return user.includes('@') ? user : `${user}@medsys.local`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const email = getEmail(username);

    try {
      if (isLogin) {
        // --- LOGIN ---
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (authError) throw authError;

        // Obtener el perfil y la clínica del usuario
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('clinic_id, role, full_name')
          .eq('id', authData.user.id)
          .single();

        if (profileError) {
          // Si no tiene perfil (usuario antiguo), lo dejamos pasar pero sin clinic_id (modo legacy)
          // O idealmente, forzamos la creación de uno. Por ahora, modo legacy compatible.
          console.warn("Usuario sin perfil:", profileError);
          const userRole = authData.user.user_metadata?.role || 'doctor';
          onLogin({ username, role: userRole, user: authData.user, clinicId: null });
        } else {
          onLogin({
            username,
            role: profileData.role,
            user: authData.user,
            clinicId: profileData.clinic_id
          });
        }

      } else {
        // --- REGISTRO ---
        let targetClinicId = null;

        // 1. Validaciones previas
        if (role === 'assistant' || role === 'doctor') {
          if (!clinicCode) throw new Error("Debe ingresar el Código del Consultorio");

          // Verificar que el consultorio existe
          const { data: clinic, error: clinicCheckError } = await supabase
            .from('clinics')
            .select('id')
            .eq('id', clinicCode)
            .single();

          if (clinicCheckError || !clinic) throw new Error("Código de consultorio inválido");
          targetClinicId = clinic.id;
        }

        // 2. Crear Usuario Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email,
          password: password,
          options: {
            data: {
              role: role,
              username: username
            }
          }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("No se pudo crear el usuario");

        // 3. Lógica según Rol
        if (role === 'admin') {
          // Admin crea nueva clínica
          const { data: clinicData, error: clinicError } = await supabase
            .from('clinics')
            .insert([{ name: `Consultorio de ${username}` }])
            .select()
            .single();

          if (clinicError) throw clinicError;
          targetClinicId = clinicData.id;
        }

        // 4. Crear Perfil vinculado
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            clinic_id: targetClinicId,
            role: role,
            full_name: username
          }]);

        if (profileError) throw profileError;

        setSuccess(role === 'admin'
          ? 'Consultorio creado exitosamente. Iniciando...'
          : 'Vinculado al consultorio exitosamente. Iniciando...');

        setTimeout(() => {
          onLogin({
            username,
            role,
            user: authData.user,
            clinicId: targetClinicId
          });
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setError(err.message === 'Invalid login credentials' ? 'Usuario o contraseña incorrectos' : err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
    setUsername('');
    setPassword('');
    setRole('admin'); // Default role for registration
    setClinicCode('');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-blue-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">DrListo</h1>
          <p className="text-blue-100">
            {isLogin ? 'Ingrese a su Consultorio Virtual' : 'Únase o Cree su Consultorio'}
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Usuario</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Ej. doctor"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contraseña</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="••••••••"
                  required
                />
              </div>
              {isLogin && (
                <div className="flex justify-end mt-1">
                  <button
                    type="button"
                    onClick={async () => {
                      const email = prompt("Ingrese su correo electrónico para recuperar la contraseña:");
                      if (email) {
                        const { error } = await supabase.auth.resetPasswordForEmail(email);
                        if (error) alert("Error: " + error.message);
                        else alert("Se ha enviado un correo de recuperación (si el correo existe).");
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    ¿Olvidó su contraseña?
                  </button>
                </div>
              )}
            </div>

            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Rol</label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="block w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                    >
                      <option value="admin">Administrador</option>
                      <option value="doctor">Médico</option>
                      <option value="assistant">Asistente</option>
                    </select>
                  </div>
                </div>

                {/* Mostrar campo de código para Médicos y Asistentes */}
                {(role === 'assistant' || role === 'doctor') && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Código del Consultorio</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        type="text"
                        value={clinicCode}
                        onChange={(e) => setClinicCode(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono"
                        placeholder="Pegue el código aquí"
                        required
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Pídale este código al administrador.</p>
                  </div>
                )}
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-green-50 text-green-600 text-sm rounded-lg border border-green-100">
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              {loading ? 'Procesando...' : (isLogin ? 'Ingresar' : (role === 'admin' ? 'Crear Consultorio' : 'Unirse al Equipo'))}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={toggleMode}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
            >
              {isLogin ? '¿Nuevo usuario? Regístrese aquí' : '¿Ya tiene cuenta? Inicie sesión'}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs text-slate-500 text-center">
              <p className="font-medium mb-2">Sistema Seguro & Encriptado</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
