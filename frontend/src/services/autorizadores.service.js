const URL = process.env.REACT_APP_API_URL + "/autorizadores";

export const getAutorizadores = async (busqueda = "") => {
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
            throw new Error(error.message || "Error al obtener las areas temáticas");
        }
        return data
    } catch (error) {
        throw error
    }
}


export const postAutorizador = async (autorizador) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(autorizador)
        });
        const data = await response.json();
        if (response.status !== 201) {
            const error = await response.json();
            throw new Error(error.message || "Error al crear el autorizador");
        }
        return data
    } catch (error) {
        throw error
    }
}