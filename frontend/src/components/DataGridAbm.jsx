import { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { descargarExcel } from "../services/excel.service.js";
import Titulo from "../components/fonts/TituloPrincipal.jsx";
import BotonCircular from "./UIElements/BotonCircular.jsx";
import Box from '@mui/material/Box';
import { Divider } from '@mui/material';

const DataGridAbm = ({ datosAMostrar, titulo }) => {

    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);


    const handleActionClick = (action, params) => {
        if (action === 'borrar') {
            
            const object = params.row;
            
        } 
    };

    useEffect(() => {
        (async () => {
            try {
                if (datosAMostrar.length > 0) {
                    // Set columns using the first row
                    const columnHeaders = datosAMostrar[0].map((header, index) => ({
                        field: `col${index}`,
                        headerName: header,
                        flex: 1,
                    }));

                    // Adding action buttons column
                    const actionColumn = {
                        field: 'Accion',
                        headerName: '',
                        flex: 1,
                        renderCell: (params) => (
                            <Box sx={{ display: 'flex', gap: 1, width: '60px', flexDirection: 'row' }}>
                                <BotonCircular icon="editar" height={40} width={40} onClick={() => handleActionClick('editar', params)} />
                                <BotonCircular icon="borrar" height={40} width={40} onClick={() => handleActionClick('borrar', params)} />
                            </Box>
                        ),
                    };

                    setColumns([...columnHeaders, actionColumn]);

                    // Set rows using the remaining rows
                    const rowData = datosAMostrar.slice(1).map((row, rowIndex) => {
                        const rowObject = { id: rowIndex };
                        row.forEach((cell, cellIndex) => {
                            rowObject[`col${cellIndex}`] = cell;
                        });
                        return rowObject;
                    });
                    setRows(rowData);
                }

            } catch (error) {
                console.error('Error al cargar los datos:', error);

            }
        })();
    }, [datosAMostrar]);

    const handleDescargarExcel = async () => {
        // Convert columns and rows to the format expected by descargarExcel
        const formattedColumns = columns.map(col => ({
            header: col.headerName,
            key: col.field
        }));

        // Call descargarExcel with the formatted data
        await descargarExcel(rows, formattedColumns, "Cronograma");
    };

    return (
        <>
            <div className="container-cronograma">
                <div className="cabecera">
                    <Titulo texto={titulo}fontWeight={"200"} />
                    <div style={{ display: 'flex', gap: 5 }}>
                        <BotonCircular icon="descargar" onClick={handleDescargarExcel} alignItems={"flex-start"} justifyContent={"flex-start"} />
                        <BotonCircular icon="agregar" onClick={handleActionClick} alignItems={"flex-start"} justifyContent={"flex-start"} />
                    </div>
                </div>
                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
                <div className="cronograma" style={{ height: 400, width: '100%' }}>
                    <DataGrid
                        rows={rows}
                        columns={columns}
                        autoHeight
                        autowidth
                    />
                </div>
            </div>
        </>
    );
}

export default DataGridAbm;
