import { useState, useEffect } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';
import { getMatrizFechas } from "../services/googleSheets.service";

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {




  const [selectedDate, setSelectedDate] = useState(null);
  const [matrizFechas, setMatrizFechas] = useState([]);


  useEffect(() => {
    (async () => {
      const response = await getMatrizFechas();
      setMatrizFechas(response);
    })();
  }, []);
  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    setSelectedDate(newDate);
    getFecha(formattedDate, id, fieldFecha); // Enviar la fecha formateada al componente padre
  };

  const shouldDisableDate = (date) => {
    // Deshabilitar los fines de semana (sábado y domingo)
    let isDisabled = false;

    const today = dayjs();
    // Verificar si la fecha es un fin de semana (sábado o domingo)
    const isWeekend = date.day() === 0 || date.day() === 6;

    // Verificar si la fecha es anterior a hoy
    const isBeforeToday = date.isBefore(today, 'day');

    if (isWeekend || isBeforeToday) {
      return true;
    }
   

    if ("fechaCursadaDesde" == fieldFecha) {

      // Verificar si la fecha es válida o inválida a través de la matriz de fechas
      let fechaAValidar = dayjs(date).format('YYYY-MM-DD').split('-');
      //Quiero el mes y dia de fechaAValidar

      const mes = parseInt(fechaAValidar[1], 10) - 1;
      const dia = parseInt(fechaAValidar[2], 10) - 1;

      if (matrizFechas[mes] && matrizFechas[mes][dia]) {
        isDisabled = !matrizFechas[mes][dia].esPosible; //Si es posible la fecha entonces no se deshabilita 
      }


    }




    return isDisabled
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en">
      <div>

        <Typography variant="body1">{mensaje}</Typography>
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
        />
      </div>
    </LocalizationProvider>
  );
};

export default Fecha;
