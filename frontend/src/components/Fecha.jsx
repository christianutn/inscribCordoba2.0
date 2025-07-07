import { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import { getFeriadosDelAnio } from '../services/api.service.js';
import { getFechasInvalidas } from '../services/instancias.service.js';
import CircularProgress from '@mui/material/CircularProgress'; // Importar CircularProgress
import Box from '@mui/material/Box';

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [feriados, setFeriados] = useState([]);
  const [isLoading, setIsLoading] = useState(false)
  const [fechasInvalidas, setFechasInvalidas] = useState([])

  useEffect(() => {
    (async () => {
      try {
        // const feriados = await getFeriadosDelAnio();
        setIsLoading(true)

        //Obtener año actual 
        dayjs.extend(utc);
        dayjs.extend(timezone);

        const ahoraArgentina = dayjs().tz('America/Argentina/Buenos_Aires');
        const anioActual = ahoraArgentina.year().toString();
        const anioSiguiente = ahoraArgentina.add(1, 'year').year().toString();
        const fechasInvalidas2025 = await getFechasInvalidas(anioActual)
        const fechasInvalidas2026 = await getFechasInvalidas(anioSiguiente)
       // const feriados = await getFeriadosDelAnio();
        //setFeriados(feriados);
        
        console.log([fechasInvalidas2025, ...fechasInvalidas2026])

        setFechasInvalidas([...fechasInvalidas2025, ...fechasInvalidas2026])

      } catch (error) {
        console.error('Error al obtener la matriz de fechas:', error);
      } finally {
        setIsLoading(false)
      }
    })();
  }, []);

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

    if (fieldFecha === "fechaCursadaDesde") {
      const fechaAValidar = dayjs(date).format('YYYY-MM-DD').split("-");
  
      const stringFecha = `${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`;

      if (fechasInvalidas.map(element => element.calendario_fecha).includes(stringFecha)) return true;
      
      if (feriados.map(element => element.fecha).includes(stringFecha)) return true;

    }



    return false;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      {/* Contenedor principal para posicionar el spinner encima */}
      <Box sx={{ position: 'relative', width: '100%' }}>
        <div className='fecha-container'>
          <Typography variant="body1" className='fecha-label'>{mensaje}</Typography>
          <DatePicker
            sx={{ width: '100%', height: '100%' }}
            value={value ? dayjs(value) : null}
            onChange={handleDateChange}
            slots={{
              textField: (params) => <TextField {...params} helperText={params?.inputProps?.placeholder} />, // Mantenemos TextField
            }}
            // inputFormat="DD/MM/YYYY" // inputFormat está obsoleto, format es el actual
            format="DD/MM/YYYY"
            shouldDisableDate={shouldDisableDate}
            className='fecha-picker'
            disabled={isLoading} // Deshabilitar el DatePicker mientras carga
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

        {/* Spinner de carga superpuesto */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)', // Fondo semitransparente opcional
              zIndex: 10, // Asegurar que esté por encima
              borderRadius: 'inherit', // Si el contenedor tiene bordes redondeados
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default Fecha;