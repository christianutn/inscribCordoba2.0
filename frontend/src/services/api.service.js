const URL = process.env.REACT_APP_API_URL + "/argentina/feriados";

export const getFeriadosDelAnio = async () => {
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
            throw new Error("No se encontraron las fechas de feriados");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export default {
    getFeriadosDelAnio
}