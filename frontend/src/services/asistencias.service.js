const URL = process.env.REACT_APP_API_URL + "/asistencias";

export const postSubaMasiva = async (archivo) => {

    const formData = new FormData();
    formData.append("excelFile", archivo);
    try {
        const response = await fetch(`${URL}/inscripciones/cargas-masivas`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: formData,
        });

        const data = await response.json();

        alert(data.message);
    } catch (error) {
        console.error("Error al enviar el archivo:", error);
        alert("Error al enviar el archivo");
    }
}

export const getCursos = async () => {
    try {
        const response = await fetch(`${URL}/cursos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener los cursos:", error);
        return [];
    }
}

export const getlistadoEventos = async () => {
    try {
        const response = await fetch(`${URL}/eventos/listado`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener los eventos:", error);
        return [];
    }
}

