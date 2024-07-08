import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import TituloPrincipal from "./fonts/TituloPrincipal.jsx";
import Button from "./UIElements/Button.jsx";
import BotonCircular from "./UIElements/BotonCircular.jsx";

const Cursos = () => {

    const handleActionClick = (action, params) => {
        console.log(`${action} clickeado`, params);
    }

    const rows = [
        { id: 1, Ministerio: 'Salud', Area: 'Medicina', Cod: '001', Nombre: 'Curso 1', Cupo: 30, PlataformaDictado: 'Online', MedioInscripcion: 'Web', TipoCapacitacion: 'Especialización', CantidadHoras: 40 },
        { id: 2, Ministerio: 'Educación', Area: 'Matemáticas', Cod: '002', Nombre: 'Curso 2', Cupo: 20, PlataformaDictado: 'Presencial', MedioInscripcion: 'Oficina', TipoCapacitacion: 'Diplomatura', CantidadHoras: 60 },
        { id: 3, Ministerio: 'Tecnología', Area: 'Programación', Cod: '003', Nombre: 'Curso 3', Cupo: 25, PlataformaDictado: 'Online', MedioInscripcion: 'App', TipoCapacitacion: 'Curso', CantidadHoras: 80 },
    ];

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
