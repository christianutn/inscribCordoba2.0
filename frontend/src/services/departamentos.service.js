
const URL = process.env.REACT_APP_API_URL + "/departamentos";

export const getDepartamentos = async () => {
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