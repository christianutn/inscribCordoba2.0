const URL ="http://localhost:4000/api/tutores";

export const getTutores = async () => {
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
            const error = await response.json();
            throw new Error(error.message || "Error al obtener los tutores");
        }

        
        
        
        return data
    } catch (error) {
        throw error
    }
}


export const putTutores = async (tutor) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...tutor
            })
        });
        const data = await response.json()
        if (response.status !== 200) {
            const error = new Error(response.message || "Error al actualizar el tutor");
            error.statusCode = 404;
            throw error;
        }


        return data
    } catch (error) {
        throw error
    }
}


export const deleteTutor = async (cuil) =>{
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
            throw new Error(error.message || "Error al eliminar el tutor");
        }
    } catch (error) {
        throw error
    }
}