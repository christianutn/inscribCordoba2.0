import React from 'react';
import Fecha from './Fecha';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import Button from '../components/UIElements/FabAlargado';
import BtnEliminar from '../components/UIElements/BotonCircular';
import { Divider } from '@mui/material';
import { Typography } from '@mui/material';
import { useState } from 'react';


const Cohorte = () => {
    const titulo = "Cohortes";

    const mensajeDesdeInscripcion = "Fecha de Inscripción desde";
    const mensajeHastaInscripcion = "Fecha de Inscripción hasta";
  

    const mensajeDesdeCursada = "Fecha de Cursada desde";
    const mensajeHastaCursada = "Fecha de Cursada hasta";




    const agregarCohorte = () => {
        const nuevoCohorte = {
            id: cohortes.length +1,
            fechaInscripcionDesde: "",
            fechaInscripcionHasta: "",
            fechaCursadaDesde: "",
            fechaCursadaHasta: "",
        };

        setCohortes([...cohortes, nuevoCohorte]);
    };

    const eliminarCohorte = (id) => {
        setCohortes((prevCohortes) => {
            // Filtramos los cohortes para eliminar el cohorte con el ID dado
            const updatedCohortes = prevCohortes.filter(cohorte => cohorte.id !== id);
            
            // Reasignamos los IDs para que sean secuenciales
            return updatedCohortes.map((cohorte, index) => ({
                ...cohorte,
                id: index + 1
            }));
        });
    };
    
    const handleInscipcionDesde = (newDate, id) => {
        
        setCohortes((prevCohortes) =>
            prevCohortes.map((cohorte) =>
              cohorte.id === id ? { ...cohorte, fechaInscripcionDesde: newDate } : cohorte
            )
          );
        

          
        
    };

    const handleInscripcionHasta = (newDate, id) => {
        
        setCohortes((prevCohortes) =>
            prevCohortes.map((cohorte) =>
              cohorte.id === id ? { ...cohorte, fechaInscripcionHasta: newDate } : cohorte
            )
          );
              
        
    };

    const handleCursadaDesde = (newDate, id) => {
        
        setCohortes((prevCohortes) =>
            prevCohortes.map((cohorte) =>
              cohorte.id === id ? { ...cohorte, fechaCursadaDesde: newDate } : cohorte
            )
          );      
        
    };

    const handleCursadaHasta = (newDate, id) => {
        
        setCohortes((prevCohortes) =>
            prevCohortes.map((cohorte) =>
              cohorte.id === id ? { ...cohorte, fechaCursadaHasta: newDate } : cohorte
            )
          );

          
        
        
    };

    //Use State

    const [cohortes, setCohortes] = useState([]);
   

    return (
        <>
            <div className="container-cohorte">
                <div className='titulo'><SubtituloPrincipal texto={titulo} /></div>

                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />
                

                {cohortes.map((cohorte, index) => (
                    <div className='cohortes' key={index}>
                        <div className='label'>
                            <Typography variant="body1">{`Cohorte N° ${index+1}: `}</Typography>
                        </div>
                        <div className="insc-desde">
                            <Fecha mensaje={mensajeDesdeInscripcion} getFecha={handleInscipcionDesde} id={index+1} />
                        </div>
                        <div className="insc-hasta">
                            <Fecha mensaje={mensajeHastaInscripcion} getFecha={handleInscripcionHasta} id={index+1}/>
                        </div>
                        <div className="curso-desde">
                            <Fecha mensaje={mensajeDesdeCursada} getFecha={handleCursadaDesde} id={index+1}/>
                        </div>
                        <div className="curso-hasta">
                            <Fecha mensaje={mensajeHastaCursada} getFecha={handleCursadaHasta} id={index+1}/>
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
