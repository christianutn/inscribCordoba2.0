import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import TextField from '@mui/material/TextField';
import { Typography } from '@mui/material';

const Fecha = ({ mensaje, getFecha, id, fieldFecha, value, ...props }) => {
  const [selectedDate, setSelectedDate] = useState(null);

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
