
const URL = process.env.REACT_APP_API_URL + "/instancias";


export const postInstancias = async (newInstancia) => {
    try {


        
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(newInstancia)
        })
        const data = await response.json();
        if(response.status !== 201) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        
        return data
    } catch (error) {
        throw error
    }
}

export const getInstancias = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al buscar instancia")
        }

        if(!data || data.length === 0) {
            throw new Error("No se encontraron instancias")
        }
        return data
    } catch (error) {
        throw error
    }
}




export const getFechasInvalidas = async (targetYear) => {
    try {
        const response = await fetch(`${URL}/get-fechas-invalidas/${targetYear}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        })

        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "Error al registrar instancia")
        }
        return data

    } catch (error) {
        throw error
    }
} 