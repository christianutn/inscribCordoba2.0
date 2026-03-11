// --- Archivo: Cohortes.jsx (COMPLETO Y CORREGIDO) ---

import { useState } from 'react';
import Fecha from './Fecha';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import Button from '../components/UIElements/FabAlargado';
import BtnEliminar from '../components/UIElements/BotonCircular';
import { Divider, Typography, Box } from '@mui/material';

// Renombrado a Cohortes (con mayúscula)
const Cohortes = ({ getCohortes, esCampusCordoba, instanciasExistentes }) => {

    const titulo = "Cohortes";
    const mensajeDesdeInscripcion = "Fecha de Inscripción desde";
    const mensajeHastaInscripcion = "Fecha de Inscripción hasta";
    const mensajeDesdeCursada = "Fecha de Cursada desde";
    const mensajeHastaCursada = "Fecha de Cursada hasta";

    // El estado ahora es local y se resetea cuando la 'key' cambia
    const [cohortes, setCohortes] = useState([]);

    const agregarCohorte = () => {
        const nuevoCohorte = {
            id: cohortes.length > 0 ? Math.max(...cohortes.map(c => c.id)) + 1 : 1, // ID único
            fechaInscripcionDesde: "",
            fechaInscripcionHasta: "",
            fechaCursadaDesde: "",
            fechaCursadaHasta: "",
        };
        const nuevasCohortes = [...cohortes, nuevoCohorte];
        setCohortes(nuevasCohortes);
        getCohortes(nuevasCohortes); // Notificar al padre
    };

    const eliminarCohorte = (id) => {
        const updatedCohortes = cohortes.filter(cohorte => cohorte.id !== id);
        setCohortes(updatedCohortes);
        getCohortes(updatedCohortes); // Notificar al padre
    };

    const handleFechas = (newDate, id, fieldFecha) => {
        const updatedCohortes = cohortes.map((cohorte) =>
            cohorte.id === id ? { ...cohorte, [fieldFecha]: newDate } : cohorte
        );
        setCohortes(updatedCohortes);
        getCohortes(updatedCohortes); // Notificar al padre
    };

    // ELIMINADO: El useEffect que causaba el bucle infinito.
    // La comunicación ahora es unidireccional (hijo a padre) a través de getCohortes.

    return (
        <>
            <div className="container-cohorte">
                <div className='titulo'><SubtituloPrincipal texto={titulo} /></div>
                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />

                {cohortes.map((cohorte, index) => {
                    const cohorteAnterior = index > 0 ? cohortes[index - 1] : null;

                    return (
                        <Box className='cohortes' key={cohorte.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: { xs: 'wrap', md: 'nowrap' }, mb: 2, '& > div': { mb: 0 } }}>
                            <div className='label'>
                                <Typography variant="body1" sx={{ mt: 1 }}>{`Cohorte N° ${index + 1}: `}</Typography>
                            </div>
                            <div className="insc-desde" style={{ flex: 1 }}>
                                <Fecha mensaje={mensajeDesdeInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionDesde" value={cohorte.fechaInscripcionDesde} />
                            </div>
                            <div className="insc-hasta" style={{ flex: 1 }}>
                                <Fecha mensaje={mensajeHastaInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionHasta" value={cohorte.fechaInscripcionHasta} />
                            </div>
                            <div className="curso-desde" style={{ flex: 1 }}>
                                <Fecha
                                    mensaje={mensajeDesdeCursada}
                                    getFecha={handleFechas}
                                    id={cohorte.id}
                                    fieldFecha="fechaCursadaDesde"
                                    value={cohorte.fechaCursadaDesde}
                                    esCampusCordoba={esCampusCordoba}
                                    fechaHastaAnterior={cohorteAnterior?.fechaCursadaHasta}
                                    instanciasExistentes={instanciasExistentes}
                                />
                            </div>
                            <div className="curso-hasta" style={{ flex: 1 }}>
                                <Fecha
                                    mensaje={mensajeHastaCursada}
                                    getFecha={handleFechas}
                                    id={cohorte.id}
                                    fieldFecha="fechaCursadaHasta"
                                    value={cohorte.fechaCursadaHasta}
                                    esCampusCordoba={esCampusCordoba}
                                    fechaDesdeActual={cohorte.fechaCursadaDesde}
                                    instanciasExistentes={instanciasExistentes}
                                />
                            </div>
                            <Box className="icon" sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
                                <BtnEliminar icon={"borrar"} width={40} height={40} justifyContent={"center"} alignItems={"center"} onClick={() => eliminarCohorte(cohorte.id)} />
                            </Box>
                        </Box>
                    );
                })}

                <div className='btnEnviar'>
                    <Button mensaje={"Agregar Cohorte"} icon={"signoMas"} onClick={agregarCohorte} justifyContent={"flex-start"}></Button>
                </div>
            </div>
        </>
    );
};

export default Cohortes;