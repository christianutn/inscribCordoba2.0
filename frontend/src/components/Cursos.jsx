import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
                

import Box from '@mui/material/Box';
import TituloPrincipal from "./fonts/TituloPrincipal.jsx";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import { getCursos } from "../services/cursos.service.js";
import {descargarExcel} from "../services/excel.service.js";
import { useEffect, useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';



const Cursos = () => {


    const [cursos, setCursos] = useState([]);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const listaCursos = await getCursos();
                setCursos(listaCursos);
                setCargando(false);

            } catch (error) {
                window.alert("Error en la carga de cursos");
            }
        })();
    }, []);

    const handleActionClick = (action, params) => {
        console.log(`${action} clickeado`, params);
    }

    //Bloque para manejar la descarga del excel

    const handleDescargarExcel = async () => {
        const data = generarDatosCurso();
         // Definir los encabezados de las columnas
         const cabecera = [
            { header: 'Area', key: 'Area', width: 30 },
            { header: 'CantidadHoras', key: 'CantidadHoras', width: 15 },
            { header: 'Cod', key: 'Cod', width: 15 },
            { header: 'Cupo', key: 'Cupo', width: 10 },
            { header: 'MedioInscripcion', key: 'MedioInscripcion', width: 30 },
            { header: 'Ministerio', key: 'Ministerio', width: 30 },
            { header: 'Nombre', key: 'Nombre', width: 50 },
            { header: 'PlataformaDictado', key: 'PlataformaDictado', width: 30 },
            { header: 'TipoCapacitacion', key: 'TipoCapacitacion', width: 20 }
        ];
        await descargarExcel(data ,cabecera, "Cursos");
    }

    const generarDatosCurso = () => {

        
        const data = cursos.map((curso) => ({
            id: curso.cod,
            Ministerio: curso.detalle_area.detalle_ministerio.nombre,
            Area: curso.detalle_area.nombre,
            Cod: curso.cod,
            Nombre: curso.nombre,
            Cupo: curso.cupo,
            PlataformaDictado: curso.detalle_plataformaDictado.nombre,
            MedioInscripcion: curso.detalle_medioInscripcion.nombre,
            TipoCapacitacion: curso.detalle_tipoCapacitacion.nombre,
            CantidadHoras: 40
        }));

        return data
    }

    const rows = generarDatosCurso();

    const columns = [
        { field: 'Ministerio', headerName: 'Ministerio', flex: 1 },
        { field: 'Area', headerName: 'Área', flex: 1 },
        { field: 'Cod', headerName: 'Código', flex: 1 },
        { field: 'Nombre', headerName: 'Nombre del Curso', flex: 1 },
        { field: 'Cupo', headerName: 'Cupo', flex: 1 },
        { field: 'PlataformaDictado', headerName: 'Plataforma de Dictado', flex: 1 },
        { field: 'MedioInscripcion', headerName: 'Medio de Inscripción', flex: 1 },
        { field: 'TipoCapacitacion', headerName: 'Tipo de Capacitación', flex: 1 },
        { field: 'CantidadHoras', headerName: 'Cantidad de Horas', flex: 1 },
        {
            field: 'Accion',
            headerName: '',
            flex: 1,
            renderCell: (params) => (
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <BotonCircular icon="editar" height={40} width={40} onClick={() => handleActionClick('editar', params)} />
                    <BotonCircular icon="borrar" height={40} width={40} onClick={() => handleActionClick('borrar', params)} />
                </Box>
            ),
        },
    ];

    return (

        
        <div className='container-cursos'>

            {
                cargando && 
                <Backdrop
                    sx={{ color: '#00519C', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={cargando}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
            }
            
            <div className='title'>
                <TituloPrincipal texto="Cursos" />
                <div className='opciones'>
                    <BotonCircular icon="descargar" onClick={handleDescargarExcel} />
                    <BotonCircular icon="agregar" />
                </div>


            </div>
            <div className='data-grid'>
                <DataGrid rows={rows} columns={columns} autoHeight />
                
            </div>
        </div>
    );
}

export default Cursos;