const URL = process.env.REACT_APP_API_URL + "/datos-desarrollo";

export const getDatosDesarrollo = async (busqueda = "", mes = "", anio = "") => {
    try {
        const response = await fetch(`${URL}?busqueda=${busqueda}&mes=${mes}&anio=${anio}`, {
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

export const postDatosDesarrollo = async (datos) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(datos)
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "No es posible registrar los datos");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export const putDatosDesarrollo = async (id, datos) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(datos)
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
            throw new Error(data.message || "No es posible borrar el registro");
        }
        return data;
    } catch (error) {
        throw error;
    }
};

export default {
    getDatosDesarrollo,
    postDatosDesarrollo,
    putDatosDesarrollo,
    deleteDatosDesarrollo
};
