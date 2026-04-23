/**
 * Servicio de autenticación vía CiDi.
 * Envía el hashCookie al backend para validar contra la API de CiDi
 * y obtener un JWT interno.
 */

const URL = process.env.REACT_APP_API_URL + "/auth";

/**
 * Envía el hashCookie al backend para login vía CiDi.
 * @param {string} hashCookie - La cookie hash de CiDi
 * @returns {Promise<string>} El JWT interno
 */
export const loginConCidi = async (hashCookie) => {
    const response = await fetch(`${URL}/cidi`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hashCookie })
    });

    const data = await response.json();

    if (response.status === 429) {
        const error = new Error('Demasiados intentos. Intenta nuevamente más tarde.');
        error.statusCode = 429;
        throw error;
    }

    if (!response.ok) {
        const error = new Error(data.message || data.error || 'Error al autenticarse con CiDi');
        error.statusCode = response.status;
        throw error;
    }

    return data.token;
};
