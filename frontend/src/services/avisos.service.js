const URL = process.env.REACT_APP_API_URL + "/avisos";

export const postAviso = async (avisoNuevo) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
            body: JSON.stringify(avisoNuevo),
        });
        const data = await response.json();

        if (response.status !== 201) throw new Error('Error al guardar el aviso');

        return data
    } catch (error) {
        throw error
    }
}


export const getAvisos = async () => {
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
            throw new Error("No se encontraron las áreas");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const deleteAviso = async (id) => {
    try {
        const response = await fetch(`${URL}/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("jwt")}`,
            },
        });

        if (response.status !== 204) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Error al eliminar el aviso');
        }

        return true
    } catch (error) {
        throw error
    }
}