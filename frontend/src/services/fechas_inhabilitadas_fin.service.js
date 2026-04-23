import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/fechas-inhabilitadas-fin";

export const getFechasInhabilitadasFin = async () => {
    try {
        const response = await apiClient(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error("No se encontraron las fechas inhabilitadas");
        }

        return data
    } catch (error) {
        throw error
    }
}

export const postFechasInhabilitadasFin = async (fechas) => {
    try {
        const response = await apiClient(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fechas)
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error("No se encontraron las fechas inhabilitadas");
        }

        return data
    } catch (error) {
        throw error
    }
}

export const deleteFechasInhabilitadasFin = async (fechas) => {
    try {
        const response = await apiClient(URL, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(fechas)
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error("No se encontraron las fechas inhabilitadas");
        }

        return data
    } catch (error) {
        throw error
    }
}
