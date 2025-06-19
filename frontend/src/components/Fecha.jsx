import { useState, useEffect, useCallback } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import { getMatrizFechas, buscarPosicionFecha } from "../services/googleSheets.service";
import { getRestricciones } from "../services/restricciones.service.js";
import { getFeriadosDelAnio } from '../services/api.service.js';
// Remove supera_cantidad_cursos_acumulado (per-day) and get_supera_cantidad_cursos_acumulado_mes (old name)
// Add getFechasInvalidasPorMes
import { supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia, getFechasInvalidasPorMes } from '../services/instancias.service.js';

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);
  const [maximoAcumulado, setMaximoAcumulado] = useState(0);
  const [feriados, setFeriados] = useState([]);
  // Rename disabledAccumulatedDates to invalidDatesInMonth
  const [invalidDatesInMonth, setInvalidDatesInMonth] = useState(new Set());
  const [isLoadingMonthData, setIsLoadingMonthData] = useState(false); // Should already exist

  // Rename fetchDisabledDatesForMonth to fetchInvalidDatesForMonthView
  const fetchInvalidDatesForMonthView = useCallback(async (dateInView) => {
    if (fieldFecha !== "fechaCursadaDesde") {
      setInvalidDatesInMonth(new Set()); // Use new setter
      return;
    }
    if (!dateInView || !dateInView.isValid()) {
      // console.warn("fetchInvalidDatesForMonthView called with invalid date:", dateInView);
      return;
    }

    setIsLoadingMonthData(true);
    const year = dateInView.year();
    const month = dateInView.month() + 1; // For 1-indexed API

    try {
      // Use the new service function
      const datesArray = await getFechasInvalidasPorMes(year, month);
      setInvalidDatesInMonth(new Set(datesArray)); // Use new setter
    } catch (error) {
      console.error(`Error fetching invalid dates for ${year}-${month}:`, error);
      setInvalidDatesInMonth(new Set()); // Use new setter
    } finally {
      setIsLoadingMonthData(false);
    }
  }, [fieldFecha, setIsLoadingMonthData, setInvalidDatesInMonth]); // Update dependencies for useCallback

  useEffect(() => {
    (async () => {
      try {
        const GSheetResponse = await getMatrizFechas();
        const restriccionesData = await getRestricciones();
        const feriadosData = await getFeriadosDelAnio();

        setFeriados(feriadosData.map(f => f.fecha));
        setMaximoAcumulado(restriccionesData.maximoAcumulado === undefined ? false : restriccionesData.maximoAcumulado);
        setMatrizFechas(GSheetResponse);

        // Call the renamed fetch function
        const dateForInitialFetch = value && dayjs(value).isValid() ? dayjs(value) : dayjs();
        // No need to check fieldFecha here, fetchInvalidDatesForMonthView does it internally
        await fetchInvalidDatesForMonthView(dateForInitialFetch);

      } catch (error) {
        console.error('Error during initial data fetch:', error);
      }
    })();
  }, [value, fieldFecha, fetchInvalidDatesForMonthView]); // Update dependency to new function name

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    setSelectedDate(newDate);
    getFecha(formattedDate, id, fieldFecha);
  };

  const shouldDisableDate = (date) => {
    const today = dayjs();
    const isWeekend = date.day() === 0 || date.day() === 6;
    const isBeforeToday = date.isBefore(today, 'day');

    if (isWeekend || isBeforeToday) {
      return true;
    }

    const formattedDateForFeriados = date.format('YYYY-MM-DD');
    if (feriados.includes(formattedDateForFeriados)) {
      return true;
    }

    if (fieldFecha === "fechaCursadaDesde") {
      const stringFecha = date.format('YYYY-MM-DD');
      // Check against the new state variable invalidDatesInMonth
      if (invalidDatesInMonth.has(stringFecha)) {
        return true;
      }
    }
    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      <div className='fecha-container'>
        <Typography variant="body1" className='fecha-label'>{mensaje}</Typography>
        <DatePicker
          sx={{ width: '100%', height: '100%' }}
          value={value ? dayjs(value) : null}
          onChange={handleDateChange}
          slots={{
            textField: (params) => <TextField {...params} />,
          }}
          inputFormat="DD/MM/YYYY"
          format="DD/MM/YYYY" // Set the format here
          shouldDisableDate={shouldDisableDate}
          // Call the new renamed function
          onMonthChange={(newMonthDate) => fetchInvalidDatesForMonthView(newMonthDate)}
          loading={isLoadingMonthData} // This should be correct
          className='fecha-picker'
          PopperProps={{
            placement: "bottom-start",
            modifiers: [
              {
                name: "flip",
                enabled: true,
                options: {
                  altBoundary: true,
                  rootBoundary: "viewport",
                  padding: 8,
                },
              },
              {
                name: "preventOverflow",
                enabled: true,
                options: {
                  altAxis: true,
                  altBoundary: true,
                  tether: true,
                  rootBoundary: "viewport",
                  padding: 8,
                },
              },
            ],
          }}
        />
      </div>
    </LocalizationProvider>
  );
};

export default Fecha;