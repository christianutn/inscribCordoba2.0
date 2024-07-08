import React, { useContext } from 'react';
import { DataContextTutores } from './context/Formulario.context.jsx';
import { DataGrid } from '@mui/x-data-grid';
import Button from './UIElements/Button.jsx';
import ButtonAlargado from "./UIElements/FabAlargado.jsx";
import TituloPrincipal from './fonts/TituloPrincipal.jsx';


const rows = [
    { id: 1, Apellido: 'Hello', Nombre: 'World', Cuil: "20378513376" },
    { id: 2, Apellido: 'DataGridPro', Nombre: 'is Awesome', Cuil: "20378513377" },
    { id: 3, Apellido: 'MUI', Nombre: 'is Amazing', Cuil: "20378513378" },
];

const columns = [
    { field: 'Apellido', headerName: 'Apellido', flex: 1 },
    { field: 'Nombre', headerName: 'Nombre', flex: 1 },
    { field: 'Cuil', headerName: 'Cuil', flex: 1 },
    {
        field: 'Accion',
        headerName: 'Acción',
        flex: 1,
        renderCell: (params) => (
            <ButtonAlargado mensaje={"Agregar"} icon="agregar" />
        ),
    },
];

const BusquedaTutores = ({ onClick }) => {
    const { setTutores, setMostrar } = useContext(DataContextTutores);

    const handleSelect = (event) => {
        setTutores(event.target.value);
    };

    const handleActionClick = (row) => {
        // Aquí puedes manejar la acción del botón
        console.log("Acción clickeada en la fila:", row);
    };



    return (
        <div className='container-busqueda-tutores'>
            <div className='titulo'>
                <TituloPrincipal texto="Búsqueda de tutores" />
            </div>


            <DataGrid rows={rows} columns={columns} />

            <div className='volver-button'>
                <Button mensaje={"Volver"} width={"10%"} hanldeOnClick={() => setMostrar("Formulario")} />
            </div>
        </div>
    );
}

export default BusquedaTutores;
