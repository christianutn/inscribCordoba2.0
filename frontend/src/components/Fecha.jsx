import { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import { getMatrizFechas, buscarPosicionFecha } from "../services/googleSheets.service";
import { getRestricciones } from "../services/restricciones.service.js";
import { getFeriadosDelAnio } from '../services/api.service.js';
import { supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_acumulado, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia} from '../services/instancias.service.js';

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);
  const [maximoAcumulado, setMaximoAcumulado] = useState(0);
  const [feriados, setFeriados] = useState([]);
  const [disabledAccumulatedDates, setDisabledAccumulatedDates] = useState(new Set()); // New state
  const [checkedAccumulatedDates, setCheckedAccumulatedDates] = useState(new Set());

  useEffect(() => {
    (async () => {
      try {
        const response = await getMatrizFechas();
        const restricciones = await getRestricciones();
        const feriados = await getFeriadosDelAnio();

        console.log("Feriados: ", feriados);

        setFeriados(feriados.map(feriado => feriado.fecha));

        setMaximoAcumulado(restricciones.maximoAcumulado === undefined ? false : restricciones.maximoAcumulado);

        setMatrizFechas(response);
      } catch (error) {
        console.error('Error al obtener la matriz de fechas:', error);
      }
    })();
  }, []);

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    setSelectedDate(newDate);
    getFecha(formattedDate, id, fieldFecha);
  };

  const shouldDisableDate = (date) => {
    const today = dayjs(); // dayjs object
    const isWeekend = date.day() === 0 || date.day() === 6;
    // 'date' is already a dayjs object as passed by DatePicker
    const isBeforeToday = date.isBefore(today, 'day');

    if (isWeekend || isBeforeToday) {
      return true;
    }

    // Add check for feriados if it's not already implicitly handled
    // Assuming 'feriados' state contains date strings in 'YYYY-MM-DD' format
    const formattedDateForFeriados = date.format('YYYY-MM-DD');
    if (feriados.includes(formattedDateForFeriados)) { // Ensure 'feriados' is accessible here
        // console.log("Deshabilitando por feriado: ", formattedDateForFeriados); // Optional: for debugging
        return true;
    }

    if (fieldFecha === "fechaCursadaDesde") {
      const stringFecha = date.format('YYYY-MM-DD'); // 'date' is a dayjs object

      // Synchronous check against the new state variable
      if (disabledAccumulatedDates.has(stringFecha)) {
        return true; // Already confirmed to be disabled
      }

      // If not yet disabled, and not yet checked
      if (!checkedAccumulatedDates.has(stringFecha)) {
            // Add to checked set immediately via state update
            setCheckedAccumulatedDates(prev => new Set(prev).add(stringFecha));

            supera_cantidad_cursos_acumulado(stringFecha)
              .then(superaAcumulado => {
                if (superaAcumulado) {
                  // If it exceeds, add to the disabled dates Set
                  setDisabledAccumulatedDates(prevDisabled => new Set(prevDisabled).add(stringFecha));
                }
              })
              .catch(error => {
                console.error(`Error checking accumulated courses for ${stringFecha}:`, error);
                // Optionally, remove from checkedAccumulatedDates if we want to allow a retry on next render?
                // For now, leave it as checked to prevent repeated errors for the same date.
              });
      }
      // On the first pass for a date, it will return false here if not already disabled or checked.
      // If supera_cantidad_cursos_acumulado returns true, the state update will trigger a re-render,
      // and then disabledAccumulatedDates.has(stringFecha) will be true.
    }

    return false; // Default to enable
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