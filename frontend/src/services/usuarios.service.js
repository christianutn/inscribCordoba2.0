const URL = "http://localhost:4000/api/usuarios"

export const getUsuarios = async () => {
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
            throw new Error("No se encontraron usuarios");
        }
        
        return data
    } catch (error) {
        throw error
    }
}


export const putUsuarios = async (usuario) => {
    try {
        const response = await fetch(URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({...usuario})
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error( data.message || "No se encontraron usuarios");
        }
        
        return data
    } catch (error) {
        throw error
    }
}

export const deleteUsuario = async (cuil) => {
    try {
        const response = await fetch(`${URL}/${cuil}`, {    
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            throw new Error(data.message || "No se encontraron usuarios");
        }
        return data
    } catch (error) {
        throw error
    }
}

export const getMyUser = async () => {
    try {
        const response = await fetch(`${URL}/myuser`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            }
        });
        const data = await response.json();
        if(response.status !== 200) {
            return false
        }
        return data
    } catch (error) {
        return false
    }
}