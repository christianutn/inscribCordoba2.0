import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Alert, CircularProgress, Paper } from '@mui/material';
import ModalConsultarCuil from './ModalConsultarCuil';
import { getlistadoEventos } from '../../services/asistencias.service.js';
import { postConfirmarAsistencia } from '../../services/asistencias.service.js';

const RegistroAsistencia = () => {
    const { courseId } = useParams();
    const [showModal, setShowModal] = useState(true); // Show immediately
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Fetch course details to verify valid QR and show course info
        const fetchCourse = async () => {
            try {
                // Note: Currently we don't have a direct getCourseById, so we fetch all and find. 
                // In a real app with many events, this should be optimized.
                const events = await getlistadoEventos();
                const foundCourse = events.find(c => c.id === parseInt(courseId));

                if (foundCourse) {
                    setCourse(foundCourse);
                } else {
                    setMessage('Curso no encontrado o código QR inválido.');
                    setShowModal(false);
                }
            } catch (error) {
                console.error(error);
                setMessage('Error al verificar el curso.');
                setShowModal(false);
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const handleConfirmAttendance = async (userData) => {
        setMessage('Registrando asistencia...');
        setShowModal(false);

        // TODO: Implementar llamada real al backend para registrar asistencia
        try {
            const response = await postConfirmarAsistencia(userData.cuil, courseId);
            setMessage(`✅ Asistencia registrada exitosamente para ${userData.nombre} ${userData.apellido} (CUIL: ${userData.cuil})`);
            setShowModal(false);
        } catch (error) {
            console.error(error);
            setMessage(`${error.message}` || 'Error al registrar asistencia.');
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%', textAlign: 'center' }}>
                <Typography variant="h4" gutterBottom color="primary">
                    Registro de Asistencia
                </Typography>

                {course && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6">{course.curso?.nombre}</Typography>
                        <Typography variant="subtitle1" color="text.secondary">{course.fecha_desde}</Typography>
                    </Box>
                )}

                {message && (
                    <Alert
                        severity={message.includes('✅') ? 'success' : 'error'}
                        sx={{ mb: 2 }}
                    >
                        {message}
                    </Alert>
                )}

                {!showModal && !message && (
                    <Typography variant="body1">
                        Espere un momento...
                    </Typography>
                )}
            </Paper>

            <ModalConsultarCuil
                open={showModal}
                onClose={() => {
                    // Evitamos cerrar el modal accidentalmente si es la pantalla principal de kiosco
                    // pero si se cierra, podríamos mostrar un mensaje o botón para reabrir
                    // setShowModal(false);
                }}
                idEvento={courseId}
                nombreCurso={course?.curso?.nombre}
                onConfirmAttendance={handleConfirmAttendance}
            />
        </Box>
    );
};

export default RegistroAsistencia;
