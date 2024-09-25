
const URL = process.env.REACT_APP_API_URL + "/restricciones/fechasInicioCursada";

export const getRestricciones = async () => {
    try {
        const response = await fetch(`${URL}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        
        if(response.status !== 200) {
            throw new Error("Error al consultar restricciones");
        }
        const data = await response.json();
        return data
    } catch (error) {
        throw error
    }
}


export const putRestriccion = async (data) => {
    try {
       
        const response = await fetch(`${URL}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(data)
        });
        
        if(response.status !== 200) {
            throw new Error("Error al actualizar restricciones");
        }
        
        return true
    } catch (error) {
        throw error
    }
}