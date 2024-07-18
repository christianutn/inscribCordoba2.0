import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import TituloPrincipal from "./fonts/TituloPrincipal.jsx";
import Button from "./UIElements/Button.jsx";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import {getCursos} from "../services/cursos.service.js";
import { useEffect, useState } from 'react';

const Cursos = () => {


    const [cursos, setCursos] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const listaCursos = await getCursos();
                setCursos(listaCursos);
                
            } catch (error) {
                window.alert("Error en la carga de cursos");
            }
        })();
    }, []);

    const handleActionClick = (action, params) => {
        console.log(`${action} clickeado`, params);
    }

    const rows = cursos.map((curso) => ({ 
        id: curso.cod, 
        Ministerio: curso.detalle_area.detalle_ministerio.nombre,
        Area: curso.detalle_area.nombre, 
        Cod: curso.cod, 
        Nombre: curso.nombre, 
        Cupo: curso.cupo, 
        PlataformaDictado: curso.detalle_plataformaDictado.nombre, 
        MedioInscripcion: curso.detalle_medioInscripcion.nombre, 
        TipoCapacitacion: curso.detalle_tipoCapacitacion.nombre, 
        CantidadHoras: 40 }));

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
            <div className='title'>
                <TituloPrincipal texto="Cursos" />
                <BotonCircular icon="agregar" />
            </div>
            <div className='data-grid'>
                <DataGrid rows={rows} columns={columns} autoHeight />
                <Button mensaje={"Volver"} width={"10%"} />
            </div>
        </div>
    );
}

export default Cursos;
