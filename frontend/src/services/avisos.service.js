const URL = process.env.REACT_APP_API_URL + "/avisos";

export const postAviso = async (avisoNuevo) => {
    try {
        const response = await fetch(URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(avisoNuevo),
        });
        const data = await response.json();

        if (response.status !== 201) throw new Error('Error al guardar el aviso');

        return data
    } catch (error) {
        throw error
    }
}


export const getAvisos = async () => {
    try {
        const avisos = await fetch(URL);
        const data = await avisos.json();

        if (avisos.status !== 200) throw new Error('Error al obtener los avisos');
        return data
    } catch (error) {
        throw error
    }
}