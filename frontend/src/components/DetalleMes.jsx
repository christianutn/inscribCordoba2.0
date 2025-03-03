import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import { getMatrizFechas } from "../services/googleSheets.service";

dayjs.locale('es');

const MonthlySummaryTable = ({ maximoCuposMensual, maximoCursosMensual }) => {
  const [rows, setRows] = useState([]);
  const [searchDate, setSearchDate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const matrizFechas = await getMatrizFechas();
        const currentYear = new Date().getFullYear();
        const monthlyData = {};

        for (let month = 0; month < 12; month++) {
          const claveMesAnio = `${currentYear}-${String(month + 1).padStart(2, '0')}`;

          let totalCupo = 0;
          let totalCursos = 0;

          for (let day = 1; day <= 31; day++) {
            const claveDia = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (matrizFechas[claveMesAnio]?.[claveDia]) {
              totalCupo += matrizFechas[claveMesAnio][claveDia].cantidadCupoDiario || 0;
              totalCursos += matrizFechas[claveMesAnio][claveDia].cantidadCursosDiario || 0;
            }
          }

          // Solo agregar si hay datos en el mes
          if (totalCupo || totalCursos) {
            monthlyData[claveMesAnio] = {
              id: month,
              mes: dayjs(`${currentYear}-${month + 1}-01`).format('MMMM YYYY'),
              cupo: totalCupo,
              cursos: totalCursos,
            };
          }
        }

        setRows(Object.values(monthlyData));
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { field: 'mes', headerName: 'Mes', flex: 1 },
    { field: 'cupo', headerName: 'Total Cupo', flex: 1 },
    { field: 'cursos', headerName: 'Total Cursos', flex: 1 },
  ];

  const filteredRows = searchDate
    ? rows.filter(row => row.mes === dayjs(searchDate).format('MMMM YYYY'))
    : rows;

  return (
    <div style={{ width: '100%' }}>
      <LocalizationProvider dateAdapter={AdapterDayjs} locale="es">
        <DatePicker
          label="Seleccionar mes"
          views={['year', 'month']}
          value={searchDate}
          onChange={(newValue) => setSearchDate(newValue)}
          slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
        />
      </LocalizationProvider>

      <div style={{ height: Math.max(300, filteredRows.length * 50 + 100), width: '100%' }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          loading={loading}
          autoHeight
          getRowClassName={(params) => {
            const cupo = params.row.cupo;
            const cursos = params.row.cursos;

            if (cupo >= maximoCuposMensual || cursos >= maximoCursosMensual) {
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
              sortModel: [{ field: 'mes', sort: 'asc' }],
            },
          }}
        />
      </div>
    </div>
  );
};

export default MonthlySummaryTable;
