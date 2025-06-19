const URL = process.env.REACT_APP_API_URL + "/areasAsignadasUsuario";

// Obtener todas las áreas asignadas
export const getAreasAsignadas = async () => {
    try {
        const response = await fetch(`${URL}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener las áreas asignadas');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export const postAreaAsignada = async (asignacionData) => {
    try {
        const response = await fetch(`${URL}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify(asignacionData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al crear la asignación');
        }

        return await response.json();
    } catch (error) {
        
        throw error;
    }
};
// Actualizar una asignación existente
export const putAreaAsignada = async (asignacionData) => {
    try {
        const response = await fetch(`${URL}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            },
            body: JSON.stringify(asignacionData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al actualizar la asignación');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Eliminar una asignación
export const deleteAreaAsignada = async (usuario, area) => {
    try {
        const response = await fetch(`${URL}/${usuario}/${area}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al eliminar la asignación');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

// Obtener áreas asignadas por usuario
export const getAreasAsignadasPorUsuario = async (usuario) => {
    try {
        const response = await fetch(`${URL}/usuario/${usuario}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt')}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al obtener las áreas asignadas del usuario');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
