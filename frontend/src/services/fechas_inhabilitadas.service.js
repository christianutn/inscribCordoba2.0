const URL = process.env.REACT_APP_API_URL + "/fechas-inhabilitadas";

export const getFechasInhabilitadas = async () => {
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
            throw new Error("No se encontraron las fechas inhabilitadas");
        }

        return data
    } catch (error) {
        throw error
    }
}

export const postFechasInhabilitadas = async (fechas) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(fechas)
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error("No se encontraron las fechas inhabilitadas");
        }

        return data
    } catch (error) {
        throw error
    }
}