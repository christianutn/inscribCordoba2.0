import { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import { getRestricciones } from "../services/restricciones.service.js";
import { getFeriadosDelAnio } from '../services/api.service.js';
import { supera_cupo_mes, supera_cupo_dia, supera_cantidad_cursos_acumulado, supera_cantidad_cursos_mes, supera_cantidad_cursos_dia } from "../services/instancias.service.js"

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);
  const [maximoAcumulado, setMaximoAcumulado] = useState(0);
  const [feriados, setFeriados] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        
        const restricciones = await getRestricciones();
        const feriados = await getFeriadosDelAnio();

        console.log("Feriados: ", feriados);

        setFeriados(feriados.map(feriado => feriado.fecha));

        setMaximoAcumulado(restricciones.maximoAcumulado === undefined ? false : restricciones.maximoAcumulado);

        
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

  const shouldDisableDate = async (date) => {
    const today = dayjs();
    const isWeekend = date.day() === 0 || date.day() === 6;
    const isBeforeToday = date.isBefore(today, 'day');

    if (isWeekend || isBeforeToday) {
      return true;
    }

    const fechaAValidar = date.format('YYYY-MM-DD').split('-');
    const fechaString = `${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`;
    console.log("Fecha a validar: ", fechaString);
    // Validamos si supera limites
    const supera_cantidad_cursos_acumulado_res = await supera_cantidad_cursos_acumulado(fechaString);
    //if(supera_cantidad_cursos_acumulado_res) return true;
    console.log("Supera cantidad cursos acumulado: ", supera_cantidad_cursos_acumulado_res);

    const supera_cantidad_cursos_mes_res = await supera_cantidad_cursos_mes(fechaString);
    //if(supera_cantidad_cursos_mes_res) return true;
    console.log("Supera cantidad cursos mes: ", supera_cantidad_cursos_mes_res);

    const supera_cantidad_cursos_dia_res = await supera_cantidad_cursos_dia(fechaString);
    //if(supera_cantidad_cursos_dia_res) return true;
    console.log("Supera cantidad cursos dia: ", supera_cantidad_cursos_dia_res);

    const supera_cupo_mes_res = await supera_cupo_mes(fechaString);
    //if(supera_cupo_mes_res) return true;
    console.log("Supera cupo mes: ", supera_cupo_mes_res);

    const supera_cupo_dia_res = await supera_cupo_dia(fechaString);
    //if(supera_cupo_dia_res) return true;
    console.log("Supera cupo dia: ", supera_cupo_dia_res);

    
    
    if (feriados.includes(`${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`)) {
      console.log("Feriado: ", `${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`);
      console.log("Feriados: ", feriados);
      return true;
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
