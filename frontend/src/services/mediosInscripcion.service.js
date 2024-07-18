
const URL = "http://localhost:4000/api/mediosInscripcion";
export const getMediosInscripcion = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`}
        });
        const data = await response.json()
        return data
    } catch (error) {
        throw error
    }
}