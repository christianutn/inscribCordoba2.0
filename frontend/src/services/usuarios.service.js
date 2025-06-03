const URL = process.env.REACT_APP_API_URL + "/usuarios";

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
        if (response.status !== 200) {
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
            body: JSON.stringify({ ...usuario })
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "No se encontraron usuarios");
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
        if (response.status !== 200) {
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
                "Authorization": `Bearer ${localStorage.getItem("jwt")} `
            }
        });
        const data = await response.json();
        if (response.status !== 200) {
            return false
        }
        return data
    } catch (error) {
        return false
    }
}


export const postUser = async (user) => {
    try {

        const response = await fetch(`${URL}/registrar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ ...user })
        });
        const data = await response.json();
        if (response.status !== 201) {
            throw new Error(data.message || "No fue posible el alta del usuario");
        }

        return data
    } catch (error) {
        throw error
    }
}

export const cambiarContrasenia = async (nuevaContrasenia) => {
    try {
        // 1. Intento primero el token de la URL
        const params = new URLSearchParams(window.location.search);
        let token = params.get("token");
        
        // 2. Si no hay token en la URL, lo saco del localStorage
        if (!token) {
            token = localStorage.getItem("jwt");
        }

        if (!token) {
            throw new Error("No se encontró token para autorizar la petición");
        }


        const response = await fetch(`${URL}/contrasenia`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ nuevaContrasenia })
        });

        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "No fue posible el cambio de contraseña");
        }

        return true;
    } catch (error) {
        throw error;
    }
};



export const recuperoContrasenia = async (cuil) => {
    try {


        const response = await fetch(`${URL}/recuperoContrasenia`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ cuil: cuil })
        });
        const data = await response.json();
        if (response.status !== 200) {
            throw new Error(data.message || "No fue posible el cambio de contraseña");
        }

        return data
    } catch (error) {
        throw error
    }
}