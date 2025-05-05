// src/services/auth.js

const URL = process.env.REACT_APP_API_URL + "/login";
const obtenerToken = async (cuil, contrasenia) => {
    try {
        const response = await fetch(URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ cuil: cuil, contrasenia: contrasenia })
        });
        const data = await response.json();

        // Verifica si la respuesta es exitosa

        if (response.status == 429) {

            const error = new Error('Demasiados intentos de inicio de sesión, por favor intenta nuevamente más tarde');
            error.statusCode = 429;
            throw error;
        }
        return data.token

    } catch (error) {

        throw error; // Re-lanza el error para que pueda ser manejado por el componente que llama a la función
    }
};

export default obtenerToken;


