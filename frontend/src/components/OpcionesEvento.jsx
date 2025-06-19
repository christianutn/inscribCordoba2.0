import React from 'react';
import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Tooltip from '@mui/material/Tooltip';

const OpcionesEvento = ({ opciones, onOpcionesChange }) => {
    const handleChange = (event) => {
        const nuevoEstado = {
            ...opciones,
            [event.target.name]: event.target.checked,
        };
        onOpcionesChange(nuevoEstado); // Llama al callback para actualizar en el padre
    };

    const { autogestionado, edad, departamento, publicaPCC, correlatividad, esNuevoEvento } = opciones;

    return (
        <Box sx={{ display: 'flex' }}>
            <FormControl sx={{ m: 3 }} component="fieldset" variant="standard">
                <FormLabel component="legend">Opciones de evento</FormLabel>
                <FormGroup>
                    <FormControlLabel
                        control={
                            <Tooltip
                                title="Los estudiantes se matriculan y reciben certificados automáticamente."
                                placement="right-start"
                                componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#333', // Fondo oscuro
                                        color: '#fff', // Texto blanco
                                        fontSize: '16px', // Tamaño de letra más grande
                                        maxWidth: '400px', // Ancho máximo del tooltip
                                        padding: '12px', // Espaciado interno
                                        borderRadius: '8px', // Bordes redondeados
                                      },
                                    },
                                  }}
                            >
                                <span>
                                    <Checkbox checked={autogestionado} onChange={handleChange} name="autogestionado" />
                                </span>
                            </Tooltip>
                        }
                        label="Autogestionado"
                    />
                    <FormControlLabel
                        control={
                            <Tooltip
                                title="Permite inscripciones públicas desde el Portal Campus Córdoba."
                                placement="right-start"
                                componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#333', // Fondo oscuro
                                        color: '#fff', // Texto blanco
                                        fontSize: '16px', // Tamaño de letra más grande
                                        maxWidth: '400px', // Ancho máximo del tooltip
                                        padding: '12px', // Espaciado interno
                                        borderRadius: '8px', // Bordes redondeados
                                      },
                                    },
                                  }}
                            >
                                <span>
                                    <Checkbox checked={publicaPCC} onChange={handleChange} name="publicaPCC" />
                                </span>
                            </Tooltip>
                        }
                        label="Publica en Portal Campus Córdoba"
                    />
                    <FormControlLabel
                        control={
                            <Tooltip
                                title="Habilita restricciones por rango de edad para inscribirse."
                                placement="right-start"
                                componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#333', // Fondo oscuro
                                        color: '#fff', // Texto blanco
                                        fontSize: '16px', // Tamaño de letra más grande
                                        maxWidth: '400px', // Ancho máximo del tooltip
                                        padding: '12px', // Espaciado interno
                                        borderRadius: '8px', // Bordes redondeados
                                      },
                                    },
                                  }}
                            >
                                <span>
                                    <Checkbox checked={edad} onChange={handleChange} name="edad" />
                                </span>
                            </Tooltip>
                        }
                        label="Restricción de edad"
                    />
                    <FormControlLabel
                        control={
                            <Tooltip
                                title="Habilita restricciones por departamentos específicos."
                                placement="right-start"
                                componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#333', // Fondo oscuro
                                        color: '#fff', // Texto blanco
                                        fontSize: '16px', // Tamaño de letra más grande
                                        maxWidth: '400px', // Ancho máximo del tooltip
                                        padding: '12px', // Espaciado interno
                                        borderRadius: '8px', // Bordes redondeados
                                      },
                                    },
                                  }}
                            >
                                <span>
                                    <Checkbox checked={departamento} onChange={handleChange} name="departamento" />
                                </span>
                            </Tooltip>
                        }
                        label="Restricción por departamento"
                    />

                    <FormControlLabel
                        control={
                            <Tooltip
                                title="Habilita restricciones por correlatividad, es decir, que un alumno previemente necesite tener un curso anterior aprobado."
                                placement="right-start"
                                componentsProps={{
                                    tooltip: {
                                      sx: {
                                        backgroundColor: '#333', // Fondo oscuro
                                        color: '#fff', // Texto blanco
                                        fontSize: '16px', // Tamaño de letra más grande
                                        maxWidth: '400px', // Ancho máximo del tooltip
                                        padding: '12px', // Espaciado interno
                                        borderRadius: '8px', // Bordes redondeados
                                      },
                                    },
                                  }}
                            >
                                <span>
                                    <Checkbox checked={correlatividad} onChange={handleChange} name="correlatividad" />
                                </span>
                            </Tooltip>
                        }
                        label="Correlatividad"
                    />

                    
                </FormGroup>

            </FormControl>
        </Box>
    );
};

export default OpcionesEvento;
