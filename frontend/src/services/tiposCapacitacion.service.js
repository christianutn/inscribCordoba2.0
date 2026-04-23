import apiClient from './apiClient';
const URL = process.env.REACT_APP_API_URL + "/tiposCapacitacion";

export const getTiposCapacitacion = async () => {
    try {
        const response = await apiClient(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al obtener los tipos de capacitaciones");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const putTiposCapacitacion = async (tipoCapacitacion) => {
    try {
        const response = await apiClient(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...tipoCapacitacion})
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al actualizar la plataforma de dictado");
        }
        return data
    } catch (error) {
        throw error
    }
}


export const postTiposCapacitacion = async (tipoCapacitacion) => {
    
    try {
        const response = await apiClient(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({...tipoCapacitacion})
        });
        const data = await response.json();
        if(response.status !== 201) {
            throw new Error(data.message || "Error al crear la plataforma de dictado");
        }
        return data
    } catch (error) {
        throw error
    }
}

export const deleteTiposCapacitacion = async (identificador) => {
    try {
        const response = await apiClient(`${URL}/${identificador}`, {
            method: "DELETE",   
            headers: {
                "Content-Type": "application/json"
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al eliminar la plataforma de dictado");
        }
        return data
    } catch (error) {
        throw error
    }
}
