import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getMatrizFechas, buscarPosicionFecha } from "../services/googleSheets.service";

dayjs.locale('es');

const DateTable = ({maximoCursosDiario, maximoCuposDiario, maximoAcumulado}) => {
  const [rows, setRows] = useState([]);
  const [searchDate, setSearchDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matrizFechas = await getMatrizFechas();
        const currentYear = new Date().getFullYear();
        const allDates = [];

        const date = new Date(currentYear, 0, 1);
        while (date.getFullYear() === currentYear) {
          allDates.push(new Date(date));
          date.setDate(date.getDate() + 1);
        }

        const formattedRows = allDates.map((fecha, index) => {
          if (!fecha || isNaN(fecha.getTime())) return null;

          const year = fecha.getFullYear();
          const month = String(fecha.getMonth() + 1).padStart(2, '0');
          const day = String(fecha.getDate()).padStart(2, '0');
          const claveDia = `${year}-${month}-${day}`;

          const formattedDate = `${day}/${month}/${year}`;
          const claveMesAnio = `${year}-${month}`;

          const posInicio = buscarPosicionFecha(claveDia, matrizFechas.listaFechasInicio);
          const posFin = buscarPosicionFecha(claveDia, matrizFechas.listaFechasFin);

          const acumulado = posInicio >= 0 && posFin >= 0
            ? matrizFechas.listaFechasInicio[posInicio].acumulado - matrizFechas.listaFechasFin[posFin].acumulado
            : 0;

          return {
            id: index,
            fecha: formattedDate,
            cupo: matrizFechas[claveMesAnio]?.[claveDia]?.cantidadCupoDiario || 0,
            cursos: matrizFechas[claveMesAnio]?.[claveDia]?.cantidadCursosDiario || 0,
            acumulado
          };
        }).filter(row => row !== null);

        setRows(formattedRows);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'fecha', headerName: 'Fecha', flex: 1 },
    { field: 'cupo', headerName: 'Cupo', flex: 1 },
    { field: 'cursos', headerName: 'Cursos', flex: 1 },
    { field: 'acumulado', headerName: 'Acumulado', flex: 1 }
  ];

  const filteredRows = searchDate
    ? rows.filter(row => row.fecha === dayjs(searchDate).format('DD/MM/YYYY'))
    : rows;

  return (
    <div style={{ width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} locale="es">
        <DatePicker
          label="Seleccionar fecha"
          format="DD/MM/YYYY"
          value={searchDate}
          onChange={(newValue) => setSearchDate(newValue)}
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
      </LocalizationProvider>

      <div style={{ height: 600, width: '100%' }}> {/* Ajusta el alto aquí */}
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={12}  // Asegura que se muestren 12 filas por página
          loading={loading}
          autoHeight={false}  // Desactiva autoHeight
          rowsPerPageOptions={[12]}  // Permite que se elija 12 por página
          pagination
          getRowClassName={(params) => {
            const cupo = params.row.cupo;
            const cursos = params.row.cursos;
            const acumulado = params.row.acumulado;

            if (cupo >= maximoCuposDiario || cursos >= maximoCursosDiario || acumulado >= maximoAcumulado) {
              return 'red-row';
            }

            return 'green-row';
          }}
          sx={{
            '& .red-row': {
              backgroundColor: 'rgba(255, 0, 0, 0.2)',
            },
            '& .green-row': {
              backgroundColor: 'rgba(0, 255, 0, 0.2)',
            },
          }}
          initialState={{
            sorting: {
              sortModel: [{ field: 'fecha', sort: 'asc' }], // Ordenar por fecha de forma ascendente
            },
            
          }}
        />
      </div>
    </div>
  );
};

export default DateTable;
