import React, { useState } from "react";

const PingTest = () => {
    const [response, setResponse] = useState(null);
    const [error, setError] = useState(null);

    const testConnection = async () => {
        try {
            const res = await fetch("http://localhost:4000/api/pings"); // Cambia 'backend' si es necesario
            if (!res.ok) throw new Error("Error en la respuesta del servidor");
            const data = await res.json();
            setResponse(data.message);
            setError(null);
        } catch (err) {
            setError(err.message);
            setResponse(null);
        }
    };

    return (
        <div>
            <h1>Prueba de Conexión</h1>
            <button onClick={testConnection}>Probar Conexión</button>
            {response && <p>Respuesta: {response}</p>}
            {error && <p style={{ color: "red" }}>Error: {error}</p>}
        </div>
    );
};

export default PingTest;
