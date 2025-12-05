import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(_error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 h-screen flex flex-col items-center justify-center">
                    <h1 className="text-2xl font-bold mb-4">Algo salió mal 😔</h1>
                    <p className="mb-4">La aplicación ha encontrado un error inesperado.</p>
                    <div className="bg-white p-4 rounded shadow border border-red-200 max-w-2xl overflow-auto text-left">
                        <p className="font-mono text-xs text-red-600 mb-2">{this.state.error && this.state.error.toString()}</p>
                        <details className="text-xs text-gray-500">
                            <summary>Ver detalles técnicos</summary>
                            <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
                        </details>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.clear();
                            window.location.reload();
                        }}
                        className="mt-6 bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
                    >
                        Borrar datos y Recargar
                    </button>
                    <p className="text-xs text-gray-500 mt-2">Nota: Esto borrará los datos locales para intentar recuperar el sistema.</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
