

const URL = "http://localhost:4000/api/ministerios";


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
            const error = new Error(response.message || "Error al actualizar el ministerio");
            error.statusCode = 404;
            throw error;
        }


        return data
    } catch (error) {
        throw error
    }
}