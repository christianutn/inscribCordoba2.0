import { getCronograma } from "../services/googleSheets.service.js";
import { useEffect, useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import { descargarExcel } from "../services/excel.service.js";
import Titulo from "../components/fonts/TituloPrincipal.jsx";



const DataGridAbm = ({datosAMostrar}) => {
    
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                
                
                if (datosAMostrar.length > 0) {
                    // Set columns using the first row
                    const columnHeaders = datosAMostrar[0].map((header, index) => ({
                        field: `col${index}`,
                        headerName: header,
                        width: 150
                    }));
                    setColumns(columnHeaders);

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
                setLoading(false);
            } catch (error) {
                console.log(error);
                setLoading(false);
            }
        })();
    }, []);

    const handleDescargarExcel = async () => {
        // Convert columns and rows to the format expected by descargarExcel
        const formattedColumns = columns.map(col => ({
            header: col.headerName,
            key: col.field
        }));


        // Call descargarExcel with the formatted data
        await descargarExcel(rows, formattedColumns, "Cronograma");
    };

    if (loading) {
        return (
            <Backdrop open={true}>
                <CircularProgress color="inherit" />
            </Backdrop>
        );
    }

    return (
        <div className="container-cronograma">

            <div className="cabecera">
                <Titulo texto="Cronograma" />
                <BotonCircular icon="descargar" onClick={handleDescargarExcel} alignItems={"flex-start"} justifyContent={"flex-start"}/>
            </div>

            <div className="cronograma" style={{ height: 400, width: '100%' }}>
                <DataGrid
                    rows={rows}
                    columns={columns}
                    autoHeight
                    disableSelectionOnClick

                />
            </div>
        </div>
    );
}

export default DataGridAbm;