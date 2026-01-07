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

        if (!response.ok) {
            throw new Error(`${data.message || 'Error al subir archivo'}`);
        }

        return true;

    } catch (error) {

        throw error;
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

export const getNotasPorCuilYEvento = async (cuil, id_evento) => {
    try {
        const response = await fetch(`${URL}/notas/${cuil}/${id_evento}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { message: "Nota no encontrada" };
            }
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener nota');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener nota:", error);
        throw error;
    }
}

export const crearOActualizarNota = async (cuil, id_evento, nota) => {
    try {
        const response = await fetch(`${URL}/notas/${cuil}/${id_evento}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({ nota: nota }) // El backend espera { nota: ... } en el body
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar nota');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al guardar nota:", error);
        throw error;
    }
}

export const putAsistencia = async (cuil, id_evento, fecha, estado_asistencia) => {
    try {
        const response = await fetch(`${URL}/manual`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify({
                cuil,
                id_evento,
                fecha,
                estado_asistencia
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al actualizar asistencia manual');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al actualizar asistencia:", error);
        throw error;
    }
}

export const getCursosDeAsistencias = async () => {
    try {
        const response = await fetch(`${URL}/cursos`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            throw new Error('Error al obtener los cursos de asistencia');
        }

        const data = await response.json();
        return data; // Expected: [{ id: 61, nombre: "CIBERSEGURIDAD" }, ...]
    } catch (error) {
        console.error("Error al obtener cursos de asistencias:", error);
        return [];
    }
}

export const postEventoManual = async (eventoData) => {
    try {
        const response = await fetch(`${URL}/eventos/manual`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
            body: JSON.stringify(eventoData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al crear evento manual');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al crear evento manual:", error);
        throw error;
    }
}

export const getDetalleEventoConAsistencia = async (id_evento) => {
    try {
        const response = await fetch(`${URL}/eventos/detalle-evento-con-asistencia/${id_evento}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("jwt")}`
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al obtener detalle del evento');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener detalle del evento:", error);
        throw error;
    }
}
