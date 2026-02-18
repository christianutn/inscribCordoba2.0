const URL = process.env.REACT_APP_API_URL + "/eventos";

export const postEvento = async (evento) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...evento })
        });
        const data = await response.json();
        if (response.status !== 201) {

            throw new Error(data.message || "Error al crear evento");
        }
        return data
    } catch (error) {
        throw error
    }
}

export const getEventos = async () => {
    try {
        const response = await fetch(URL,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("jwt")}`
                }
            }
        );
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener eventos");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

export const deleteEvento = async (curso) => {
    try {
        const response = await fetch(URL + "/" + curso, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al eliminar evento");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

export const putEvento = async (evento) => {
    try {
        const response = await fetch(URL + "/" + evento.curso, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...evento })
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al actualizar evento");
        }
        return data;
    } catch (error) {
        throw error;
    }
}

/**
 * Actualiza Evento y Curso en una sola petición.
 * Envía todos los campos (de evento + curso) al endpoint PUT /eventos/:curso
 */
export const putEventoYCurso = async (payload) => {
    try {
        const response = await fetch(URL + "/" + payload.curso, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al actualizar evento y curso");
        }
        return data;
    } catch (error) {
        throw error;
    }
}


