
const URL = "http://localhost:4000/api/mediosInscripcion";
export const getMediosInscripcion = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`}
        });

        const data = await response.json();
        if(response.status !== 200) {
            
            throw new Error(data.message || "Error al obtener los medios de inscripción");
        }
        
        
        return data
    } catch (error) {
        throw error
    }
}


export const putMedioInscripcion = async (medioInscripcion) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...medioInscripcion
            })
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al actualizar el medio de inscripción");
        }
        
        return data
    } catch (error) {
        throw error
    }
}

export const deleteMedioInscripcion = async (cod) => {
    try {
        const response = await fetch(`${URL}/${cod}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al eliminar el medio de inscripción");
        }
        return data
    } catch (error) {
        throw error
    }
}