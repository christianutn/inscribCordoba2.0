const URL = process.env.REACT_APP_API_URL + "/efemerides";

/**
 * Obtiene todas las efemérides.
 */
export const getEfemerides = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener las efemérides");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Obtiene las efemérides de un curso específico.
 * @param {string} curso - Código del curso
 */
export const getEfemeridesByCurso = async (curso) => {
    try {
        const response = await fetch(`${URL}/curso/${curso}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener efemérides del curso");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Crea una o más efemérides para un curso.
 * @param {Object} payload - { curso: string, efemerides: [{ fecha, descripcion }] }
 */
export const postEfemerides = async (payload) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "Error al crear las efemérides");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Actualiza una efeméride existente.
 * @param {number} id - ID de la efeméride
 * @param {Object} payload - { fecha, descripcion, observacion, url_disenio }
 */
export const putEfemeride = async (id, payload) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(payload)
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al actualizar la efeméride");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

/**
 * Elimina una efeméride por su ID.
 * @param {number} id - ID de la efeméride
 */
export const deleteEfemeride = async (id) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al eliminar la efeméride");
        }
        return data;
    } catch (error) {
        throw error;
    }
};
