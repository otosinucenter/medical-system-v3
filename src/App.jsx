import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import MedicalSystem from './MedicalSystem';
import Landing from './Landing';
import PublicAppointmentForm from './PublicAppointmentForm';
import ErrorBoundary from './ErrorBoundary';

function AppContent() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedUser = localStorage.getItem('medical_system_user');
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser));
            } catch (error) {
                console.error("Error parsing user from localStorage:", error);
                localStorage.removeItem('medical_system_user'); // Clear corrupted data
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = (userData) => {
        setUser(userData);
        localStorage.setItem('medical_system_user', JSON.stringify(userData));
    };

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('medical_system_user');
    };

    if (loading) return null; // O un spinner

    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route
                path="/app"
                element={
                    !user ? (
                        <Login onLogin={handleLogin} />
                    ) : (
                        <ErrorBoundary>
                            <MedicalSystem user={user} onLogout={handleLogout} />
                        </ErrorBoundary>
                    )
                }
            />
            <Route path="/citas/:clinicId" element={<PublicAppointmentForm />} />
            {/* Redirigir cualquier otra ruta a la landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AppContent />
        </BrowserRouter>
    );
}
