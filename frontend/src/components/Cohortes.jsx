import React, { useEffect } from 'react';
import Fecha from './Fecha';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import Button from '../components/UIElements/FabAlargado';
import BtnEliminar from '../components/UIElements/BotonCircular';
import { Divider } from '@mui/material';
import { Typography } from '@mui/material';
import { useState } from 'react';
import validarFecha from "../services/validarFechas.js"


const Cohorte = ({getCohortes}) => {



    const titulo = "Cohortes";

    const mensajeDesdeInscripcion = "Fecha de Inscripción desde";
    const mensajeHastaInscripcion = "Fecha de Inscripción hasta";


    const mensajeDesdeCursada = "Fecha de Cursada desde";
    const mensajeHastaCursada = "Fecha de Cursada hasta";




    const agregarCohorte = () => {
        const nuevoCohorte = {
            id: cohortes.length + 1,
            fechaInscripcionDesde: "",
            fechaInscripcionHasta: "",
            fechaCursadaDesde: "",
            fechaCursadaHasta: "",
        };

        setCohortes([...cohortes, nuevoCohorte]);
    };

    const eliminarCohorte = (id) => {
        
        setCohortes((prevCohortes) => {
            const updatedCohortes = prevCohortes.filter(cohorte => cohorte.id !== id);
            const reassignedCohortes = updatedCohortes.map((cohorte, index) => ({
                ...cohorte,
                id: index + 1
            }));

            return reassignedCohortes;
        });
    };




    const handleFechas = (newDate, id, fieldFecha) => {

        setCohortes((prevCohortes) =>
            prevCohortes.map((cohorte) =>
                cohorte.id === id ? { ...cohorte, [fieldFecha]: newDate } : cohorte
            )
        );

       
    };


    //Use State

    const [cohortes, setCohortes] = useState([]);

    useEffect(() => {
        getCohortes(cohortes);
    }, [cohortes, getCohortes]);


    return (
        <>
            <div className="container-cohorte">
                <div className='titulo'><SubtituloPrincipal texto={titulo} /></div>

                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />


                {cohortes.map((cohorte, index) => (
                    <div className='cohortes' key={index}>
                        <div className='label'>
                            <Typography variant="body1">{`Cohorte N° ${index + 1}: `}</Typography>
                        </div>
                        <div className="insc-desde">
                            <Fecha mensaje={mensajeDesdeInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionDesde" value={cohorte.fechaInscripcionDesde}/>

                            

                        </div>
                        <div className="insc-hasta">
                            <Fecha mensaje={mensajeHastaInscripcion} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaInscripcionHasta" value={cohorte.fechaInscripcionHasta} />

                        </div>
                        <div className="curso-desde">
                            <Fecha mensaje={mensajeDesdeCursada} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaCursadaDesde" value={cohorte.fechaCursadaDesde}
/>
                        </div>
                        <div className="curso-hasta">
                            <Fecha mensaje={mensajeHastaCursada} getFecha={handleFechas} id={cohorte.id} fieldFecha="fechaCursadaHasta" value={cohorte.fechaCursadaHasta}/>
                        </div>
                        <div className="icon">
                            <BtnEliminar icon={"borrar"} width={50} height={50} justifyContent={"flex-start"} alignItems={"flex-end"} onClick={() => eliminarCohorte(cohorte.id)} />
                        </div>
                        <div className='diver'>
                            <Divider />
                        </div>
                       
                       
                    </div>

                ))}

                <div className='btnEnviar'>
                    <Button mensaje={"Agregar Cohorte"} icon={"signoMas"} onClick={agregarCohorte} justifyContent={"flex-start"}></Button>
                </div>
        
            </div>
        </>
    );
};

export default Cohorte; 
