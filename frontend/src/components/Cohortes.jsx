// --- Archivo: Cohortes.jsx (COMPLETO Y CORREGIDO) ---

import { useState } from 'react';
import Fecha from './Fecha';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import Button from '../components/UIElements/FabAlargado';
import BtnEliminar from '../components/UIElements/BotonCircular';
import { Divider, Typography } from '@mui/material';

// Renombrado a Cohortes (con mayúscula)
const Cohortes = ({ getCohortes }) => {

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

                {cohortes.map((cohorte, index) => (
                    <div className='cohortes' key={cohorte.id}> {/* Usar un ID estable como key */}
                        <div className='label'>
                            <Typography variant="body1">{`Cohorte N° ${index + 1}: `}</Typography>
                        </div>
                        <div className="insc-desde">
                            <Fecha mensaje={mensajeDesdeInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionDesde" value={cohorte.fechaInscripcionDesde} />
                        </div>
                        <div className="insc-hasta">
                            <Fecha mensaje={mensajeHastaInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionHasta" value={cohorte.fechaInscripcionHasta} />
                        </div>
                        <div className="curso-desde">
                            <Fecha mensaje={mensajeDesdeCursada} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaCursadaDesde" value={cohorte.fechaCursadaDesde} />
                        </div>
                        <div className="curso-hasta">
                            <Fecha mensaje={mensajeHastaCursada} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaCursadaHasta" value={cohorte.fechaCursadaHasta} />
                        </div>
                        <div className="icon">
                            <BtnEliminar icon={"borrar"} width={50} height={50} justifyContent={"flex-start"} alignItems={"flex-end"} onClick={() => eliminarCohorte(cohorte.id)} />
                        </div>
                        <div className='diver'><Divider /></div>
                    </div>
                ))}

                <div className='btnEnviar'>
                    <Button mensaje={"Agregar Cohorte"} icon={"signoMas"} onClick={agregarCohorte} justifyContent={"flex-start"}></Button>
                </div>
            </div>
        </>
    );
};

export default Cohortes;