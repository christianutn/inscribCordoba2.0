const URL = process.env.REACT_APP_API_URL + "/tiposRolTutor"

export const getTiposRolTutor = async () => {
    try {
        const response = await fetch(URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "Error al obtener los tipos de rol de tutor");
        }

        return data
    } catch (error) {
        throw error
    }
}

