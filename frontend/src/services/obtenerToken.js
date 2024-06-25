// src/services/auth.js
const obtenerToken = async (cuil, contrasenia) => {
    try {
        const response = await fetch('http://localhost:4000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cuil: cuil, contrasenia: contrasenia })
        });

        // Verifica si la respuesta es exitosa
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al iniciar sesión');
        }

        const data = await response.json();
        return data.token;
    } catch (error) {
        
        throw error; // Re-lanza el error para que pueda ser manejado por el componente que llama a la función
    }
};

export default obtenerToken;
