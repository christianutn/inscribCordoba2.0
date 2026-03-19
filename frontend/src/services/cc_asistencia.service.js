const URL = process.env.REACT_APP_API_URL + '/cc-asistencias';

const getHeaders = (isFormData = false) => {
    const headers = {
        "Authorization": `Bearer ${localStorage.getItem("jwt")}`
    };
    if (!isFormData) {
        headers["Content-Type"] = "application/json";
    }
    return headers;
};

const handleResponse = async (response) => {
    // Para rutas publicas o manejo mixto, algunos pueden no tener status ok
    if (!response.ok) {
        let errorData;
        try {
            errorData = await response.json();
        } catch {
            throw new Error(`Error ${response.status}: Ha ocurrido un error inesperado.`);
        }
        throw new Error(errorData.message || 'Error en la solicitud');
    }
    const data = await response.json();
    return data;
};

// EVENTOS
export const getCcAsistenciaEventos = async () => {
    const response = await fetch(`${URL}/eventos`, { method: "GET", headers: getHeaders() });
    return handleResponse(response);
};

export const getCcAsistenciaEventoById = async (id) => {
    // public endpoint for QR registration maybe? Let's assume standard headers first
    const response = await fetch(`${URL}/eventos/${id}`, { method: "GET" });
    return handleResponse(response);
};

export const createCcAsistenciaEvento = async (data) => {
    const response = await fetch(`${URL}/eventos`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
};

export const updateCcAsistenciaEvento = async (id, data) => {
    const response = await fetch(`${URL}/eventos/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
};

export const deleteCcAsistenciaEvento = async (id) => {
    const response = await fetch(`${URL}/eventos/${id}`, { method: "DELETE", headers: getHeaders() });
    return handleResponse(response);
};

// INSCRIPTOS
export const getInscriptosByEvento = async (evento_id) => {
    const response = await fetch(`${URL}/inscriptos/evento/${evento_id}`, { method: "GET", headers: getHeaders() });
    return handleResponse(response);
};

export const updateNotaYAsistencia = async (id, data) => {
    const response = await fetch(`${URL}/inscriptos/${id}`, { method: "PUT", headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
};

// QR or manual assistance
export const confirmarCcAsistencia = async (data) => {
    const response = await fetch(`${URL}/inscriptos/confirmar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return handleResponse(response);
};

// Excel Bulk (For inscriptions)
export const cargarInscriptosMasivos = async (data) => {
    const response = await fetch(`${URL}/inscriptos/masivos`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
};

// PARTICIPANTES
export const upsertParticipanteG = async (data) => {
    const response = await fetch(`${URL}/participantes/upsert`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    return handleResponse(response);
};

// Excel Bulk (For participants)
export const upsertParticipantesMasivos = async (data) => {
    const response = await fetch(`${URL}/participantes/masivos`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) });
    return handleResponse(response);
};

// CIDI lookup
export const getPersonaCidi = async (cuil) => {
    const response = await fetch(`${URL}/participantes/cidi/${cuil}`, { method: "GET" }); // assuming could be public or tokenless for QR registration
    return handleResponse(response);
};

export default {
    getCcAsistenciaEventos,
    getCcAsistenciaEventoById,
    createCcAsistenciaEvento,
    updateCcAsistenciaEvento,
    deleteCcAsistenciaEvento,
    getInscriptosByEvento,
    updateNotaYAsistencia,
    confirmarCcAsistencia,
    cargarInscriptosMasivos,
    upsertParticipanteG,
    upsertParticipantesMasivos,
    getPersonaCidi
};
