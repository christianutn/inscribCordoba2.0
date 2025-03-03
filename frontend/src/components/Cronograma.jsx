import { getCronograma } from "../services/googleSheets.service.js";
import { useEffect, useState } from 'react';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import { DataGrid } from '@mui/x-data-grid';
import BotonCircular from "./UIElements/BotonCircular.jsx";
import { descargarExcel } from "../services/excel.service.js";
import Titulo from "../components/fonts/TituloPrincipal.jsx";
import Divider from '@mui/material/Divider';

const Cronograma = () => {
    const [cronograma, setCronograma] = useState([]);
    const [columns, setColumns] = useState([]);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                console.log("🔵 Llamando a getCronograma");
                const dataCronograma = await getCronograma();
                
                setCronograma(dataCronograma);
                if (dataCronograma.length > 0) {
                    // Set columns using the first row
                    const columnHeaders = dataCronograma[0].map((header, index) => ({
                        field: `col${index}`,
                        headerName: header,
                        width: 150
                    }));
                    setColumns(columnHeaders);

                    // Set rows using the remaining rows
                    const rowData = dataCronograma.slice(1).map((row, rowIndex) => {
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
               
                setLoading(false);
            }
        })();
    }, []);

    const handleDescargarExcel = async () => {
        // Call descargarExcel with the formatted data
        await descargarExcel(rows, columns, "Cronograma");
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
                <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black', marginTop: 2 }} />
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

export default Cronograma;
