const URL = process.env.REACT_APP_API_URL + "/diccionarioChatbotnr";

export const getDiccionarioChatbotnr = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error("No se encontraron registros");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const insertDiccionarioChatbotnr = async (diccionario) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...diccionario }), // Convertir el objeto a JSON
        });

        if (response.status !== 201 && response.status !== 200) { // Verificar el estado adecuado para un POST exitoso (normalmente 201)
            const errorData = await response.json(); // Intentar obtener los detalles del error del servidor
            throw new Error(errorData.message || 'Error desconocido al procesar la solicitud.');
        }

        const data = await response.json(); // Procesar la respuesta si es necesario
        return data; // Devolver la respuesta procesada
    } catch (error) {
        console.error("Error al insertar en el diccionario de preguntas no registradas:", error);
        throw error; // Propagar el error para manejarlo fuera
    }
};


