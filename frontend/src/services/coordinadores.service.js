const URL = process.env.REACT_APP_API_URL + "/coordinadores";

export const getCoordinadores = async () => {
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
            throw new Error(data.message || "Error al obtener las areas temáticas");
        }
        return data
    } catch (error) {
        throw error
    }
}


export const postCoordinador = async (coordinador) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...coordinador })
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "Error al crear el coordinador");
        }
        return data
    } catch (error) {
        throw error
    }
}