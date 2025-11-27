
const URL = process.env.REACT_APP_API_URL + "/tutores";

export const getTutores = async (busqueda = "") => {
    try {
        const response = await fetch(`${URL}?busqueda=${busqueda}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
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


export const deleteTutor = async (cuil) => {
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

export const postTutores = async (tutor) => {
    try {

        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...tutor
            })
        });
        const data = await response.json();
        if (response.status !== 201) {
            const error = new Error(data.message || "Error al crear el tutor");
            error.statusCode = 404;
            throw error;
        }
        return data
    } catch (error) {
        throw error
    }
}