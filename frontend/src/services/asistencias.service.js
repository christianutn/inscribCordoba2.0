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


export const getConsultarAsistencia = async (cuil, id_evento) => {
    try {
        const response = await fetch(`${URL}/consultar/${cuil}/${id_evento}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al consultar asistencia');
        }

        const data = await response.json();
        return data; // { nombre, apellido, cuil, existe }
    } catch (error) {
        console.error("Error al consultar asistencia:", error);
        throw error;
    }
}

export const postConfirmarAsistencia = async (cuil, id_evento) => {
    try {
        const response = await fetch(`${URL}/confirmar`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ cuil, id_evento })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al confirmar asistencia');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al confirmar asistencia:", error);
        throw error;
    }
}

export const getListadosDeParticipantes = async (id_evento) => {
    try {
        const response = await fetch(`${URL}/operaciones/participantes?id_evento=${id_evento}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener lista de participantes');
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error al obtener lista de participantes:", error);
        throw error;
    }
}

export const getAsistenciaPorEvento = async (id_evento, cuil) => {
    try {
        const response = await fetch(`${URL}/obtenerListadoDeParticipantesPorEvento?id_evento=${id_evento}&cuil=${cuil}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener asistencia por evento');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener asistencia por evento:", error);
        throw error;
    }
}
