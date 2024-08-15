const URL = "http://localhost:4000/api/areas";

export const getAreas = async () => {
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
            throw new Error("No se encontraron las áreas");
        }
        
        return data
    } catch (error) {
        throw error
    }
}

export const putArea = async (area) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                ...area
            })
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error("No se pudo modificar la dirección");
        }
        
        return data
    } catch (error) {
        throw error
    }
}