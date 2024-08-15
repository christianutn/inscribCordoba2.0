const URL = "http://localhost:4000/api/roles";


export const getRoles = async () => {
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
            throw new Error(data.message || "Error al obtener los roles de usuario");
        }
        
        return data
    } catch (error) {
        throw error
    }
}