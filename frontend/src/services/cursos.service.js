const URL = "http://localhost:4000/api/cursos";

export const getCursos = async () => {
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
            throw new Error("No se encontraron los cursos");
        }
        
        return data
    } catch (error) {
        throw error
    }
}