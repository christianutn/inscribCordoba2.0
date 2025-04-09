const URL = process.env.REACT_APP_API_URL + "/eventos";

export const postEvento = async (evento) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {                
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({...evento})
        });
        const data = await response.json();        
        if (response.status !== 201) {
            
            throw new Error(data.message || "Error al crear evento");
        }
        return data
    } catch (error) {
        throw error
    }
}

