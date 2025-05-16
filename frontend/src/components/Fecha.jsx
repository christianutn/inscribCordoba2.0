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

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);
  const [maximoAcumulado, setMaximoAcumulado] = useState(0);
  const [feriados, setFeriados] = useState([]);

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
    const today = dayjs();
    const isWeekend = date.day() === 0 || date.day() === 6;
    const isBeforeToday = date.isBefore(today, 'day');

    if (isWeekend || isBeforeToday) {
      return true;
    }

    if (!matrizFechas.listaFechasFin || !matrizFechas.listaFechasInicio ||
      matrizFechas.listaFechasFin.length === 0 || matrizFechas.listaFechasInicio.length === 0) {
      return false;
    }

    if (fieldFecha === "fechaCursadaDesde" && matrizFechas) {
      const fechaAValidar = dayjs(date).format('YYYY-MM-DD').split("-");
      const claveAnioMes = `${fechaAValidar[0]}-${fechaAValidar[1]}`;
      const claveDia = `${claveAnioMes}-${fechaAValidar[2]}`;

      if (matrizFechas[claveAnioMes]) {



        const posInicio = buscarPosicionFecha(claveDia, matrizFechas.listaFechasInicio);
        const posFin = buscarPosicionFecha(claveDia, matrizFechas.listaFechasFin);

        if (posInicio === -1 || posFin === -1) return false;

        const acumulado = matrizFechas.listaFechasInicio[posInicio]?.acumulado - matrizFechas.listaFechasFin[posFin]?.acumulado;

        if (acumulado >= maximoAcumulado) {
          return true;
        }

        if (matrizFechas[claveAnioMes]?.invalidarMesAnio || matrizFechas[claveAnioMes]?.[claveDia]?.invalidarDia) {
          return true;
        }
        
        if (feriados.includes(`${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`)) {
          console.log("Feriado: ", `${fechaAValidar[0]}-${fechaAValidar[1]}-${fechaAValidar[2]}`);
          console.log("Feriados: ", feriados);
          return true;
        }

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
