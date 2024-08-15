const URL = "http://localhost:4000/api/plataformasDictado";

export const getPlataformasDictado = async () => {
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
            throw new Error(data.message || "Error al obtener las plataformas de dictado");
        }
        
        return data
    } catch (error) {
        throw error
    }
}

export const putPlataformaDictado = async (plataformaDictado) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({...plataformaDictado})
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