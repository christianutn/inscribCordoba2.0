


const URL = process.env.REACT_APP_API_URL + "/ministerios";


export const getMinisterios = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });

        const data = await response.json()
        if (response.status !== 200) {

            const error = new Error(data.message || "No existen ministerios");
            error.statusCode = 404;
            throw error;
        }



        return data
    } catch (error) {

        throw error
    }
}

export const putMinisterios = async (ministerio) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...ministerio
            })
        });
        const data = await response.json()
        if (response.status !== 200) {
            throw new Error(`${data.message}` || "No es posible actualizar el registro");

        }


        return data
    } catch (error) {
        throw error
    }
}

export const postMinisterios = async (ministerio) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...ministerio
            })
        });
        const data = await response.json()
        if (response.status !== 200) {
            const error = new Error(response.message || "Error al crear el ministerio");
            error.statusCode = 404;
            throw error;
        }

        return data
    } catch (error) {
        throw error
    }
}

export const deleteMinisterio = async (codMinisterios) => {
    try {
        const response = await fetch(`${URL}/${codMinisterios}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });

        const data = await response.json()
        if (response.status !== 200) {
            const error = new Error(response.message || "Error al borrar el ministerio");
            error.statusCode = 404;
            throw error;
        }
    } catch (error) {
        throw error
    }
}