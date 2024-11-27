
const URL = process.env.REACT_APP_API_URL + "/categoriaChatbot";

export const getCategoriasChatbot = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",

            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error("No se encontraron las categorías de chatbot");
        }

        return data
    } catch (error) {
        throw error
    }
}

export const insertCategoriasChatbot = async (categoria) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...categoria }), // Convertir el objeto a JSON
        });

        if (response.status !== 201 && response.status !== 200) { // Verificar el estado adecuado para un POST exitoso (normalmente 201)
            throw new Error("No se pudo insertar la categoría en el chatbot");
        }

        const data = await response.json(); // Procesar la respuesta si es necesario
        return data; // Devolver la respuesta procesada
    } catch (error) {
        console.error("Error al insertar categoría:", error);
        throw error; // Propagar el error para manejarlo fuera
    }
}



