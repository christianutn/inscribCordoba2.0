import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/autorizadores";

export const getAutorizadores = async (busqueda = "") => {
    try {
        const response = await apiClient(`${URL}?busqueda=${busqueda}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener las areas temáticas");
        }
        return data
    } catch (error) {
        throw error
    }
}


export const postAutorizador = async (autorizador) => {
    try {
        const response = await apiClient(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                ...autorizador
            })
        });

        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "Error al crear el autorizador");
        }
        return data
    } catch (error) {
        throw error
    }
}
