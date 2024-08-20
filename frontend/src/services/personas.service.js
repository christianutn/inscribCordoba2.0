const URL = "http://localhost:4000/api/personas"


export const getPersonas = async () => {
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
            const error = await response.json();
            throw new Error(error.message || "Error al obtener las personas");
        }
        return data
    } catch (error) {
        throw error
    }
}

export const postPersona = async (persona) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(persona)
        });
        const data = await response.json();
        if (response.status !== 201) {
            
            throw new Error(data.message || "Error al registrar la persona");
        }
        return data
    } catch (error) {
        throw error
    }
}

export const putPersona = async (persona) => {

    console.log("PERSONA: ", persona)
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...persona
            })
        });

        
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(error.message || "Error al actualizar la persona");
        }
        const data = await response.json();
        return data
    } catch (error) {
        
        throw error
    }
}

export const deletePersona = async (cuil) => {
    try {
        const response = await fetch(`${URL}/${cuil}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            const error = await response.json();
            throw new Error(error.message || "Error al eliminar la persona");
        }
        return data
    } catch (error) {
        throw error
    }
}