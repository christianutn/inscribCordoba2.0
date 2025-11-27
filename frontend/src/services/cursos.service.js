
const URL = process.env.REACT_APP_API_URL + "/cursos";

export const getCursos = async (busqueda = "") => {
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
            throw new Error("No se encontraron los cursos");
        }

        return data
    } catch (error) {
        throw error
    }
}


export const postCurso = async (curso) => {
    try {

        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...curso })
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al registrar el curso");
        }

        return data
    } catch (error) {
        throw error
    }
}


export const putCurso = async (curso) => {
    try {



        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...curso
            })
        });


        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al registrar el curso");
        }

        return data
    } catch (error) {
        throw error
    }
}


export const deleteCurso = async (cuil) => {
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
            throw new Error(data.message || "Error al registrar el curso");
        }

        return data
    } catch (error) {
        throw error
    }
}


