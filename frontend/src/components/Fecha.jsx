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
import { supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_acumulado, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia, get_supera_cantidad_cursos_acumulado_mes } from '../services/instancias.service.js';

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);
  const [maximoAcumulado, setMaximoAcumulado] = useState(0);
  const [feriados, setFeriados] = useState([]);
  const [disabledAccumulatedDates, setDisabledAccumulatedDates] = useState(new Set());
  const [isLoadingMonthData, setIsLoadingMonthData] = useState(false);

  const fetchDisabledDatesForMonth = useCallback(async (dateInView) => {
    if (!dateInView || !dateInView.isValid()) {
      // console.warn("fetchDisabledDatesForMonth called with invalid date:", dateInView);
      return;
    }
    if (fieldFecha !== "fechaCursadaDesde") {
      setDisabledAccumulatedDates(new Set());
      return;
    }

    setIsLoadingMonthData(true);
    const year = dateInView.year();
    const month = dateInView.month() + 1; // dayjs month is 0-indexed, API expects 1-indexed

    try {
      const datesArray = await get_supera_cantidad_cursos_acumulado_mes(year, month);
      setDisabledAccumulatedDates(new Set(datesArray));
    } catch (error) {
      console.error(`Error fetching accumulated dates for ${year}-${month}:`, error);
      setDisabledAccumulatedDates(new Set());
    } finally {
      setIsLoadingMonthData(false);
    }
  }, [fieldFecha, setDisabledAccumulatedDates, setIsLoadingMonthData]);

  useEffect(() => {
    (async () => {
      try {
        const GSheetResponse = await getMatrizFechas(); // Renamed to avoid conflict if any
        const restriccionesData = await getRestricciones(); // Renamed
        const feriadosData = await getFeriadosDelAnio();

        setFeriados(feriadosData.map(f => f.fecha));
        setMaximoAcumulado(restriccionesData.maximoAcumulado === undefined ? false : restriccionesData.maximoAcumulado);
        setMatrizFechas(GSheetResponse);

        if (fieldFecha === "fechaCursadaDesde") {
          const dateForInitialFetch = value && dayjs(value).isValid() ? dayjs(value) : dayjs();
          await fetchDisabledDatesForMonth(dateForInitialFetch);
        } else {
          setDisabledAccumulatedDates(new Set());
        }

      } catch (error) {
        console.error('Error during initial data fetch:', error);
      }
    })();
  }, [value, fieldFecha, fetchDisabledDatesForMonth]);

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
      if (disabledAccumulatedDates.has(stringFecha)) {
        return true;
      }
    }
    //isLoadingMonthData can be used here to disable all dates while loading new month data
    // if (isLoadingMonthData) return true;
    // However, this might be too aggressive. The DatePicker shows a loading indicator.

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
          onMonthChange={(newMonthDate) => fetchDisabledDatesForMonth(newMonthDate)}
          loading={isLoadingMonthData} // Show loading indicator on DatePicker
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