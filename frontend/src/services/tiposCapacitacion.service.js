const URL = "http://localhost:4000/api/tiposCapacitacion";

export const getTiposCapacitacion = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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
        const response = await fetch(`${URL}/${identificador}`, {
            method: "DELETE",   
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
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