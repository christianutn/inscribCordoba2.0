
const URL = process.env.REACT_APP_API_URL + "/datos-desarrollo";

export const getDatosDesarrollo = async () => {
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
            throw new Error(data.message || "No se encontraron los datos de desarrollo");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const getDatosDesarrolloById = async (id) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "No se encontró el registro");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const postDatosDesarrollo = async (registro) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...registro })
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "No es posible registrar el dato de desarrollo");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const putDatosDesarrollo = async (id, registro) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...registro })
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "No es posible actualizar el registro");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const deleteDatosDesarrollo = async (id) => {
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
            throw new Error(data.message || "No es posible eliminar el registro");
        }
        return data;
    } catch (error) {
        throw error;
    }
};
