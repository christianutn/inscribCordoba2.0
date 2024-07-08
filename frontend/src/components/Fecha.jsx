import { useState } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';
import dayjs from 'dayjs';

export default function Fecha({ mensaje, getFecha }) {
  const [selectedDate, setSelectedDate] = useState(null);

  const handleDateChange = (newDate) => {
    const formattedDate = newDate ? dayjs(newDate).format('YYYY-MM-DD') : null;
    setSelectedDate(newDate);
    getFecha(formattedDate); // Enviar la fecha formateada al componente padre
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div>
        <SubtituloPrincipal texto={mensaje} variant={'h6'} fontWeight={500} />
        <DatePicker
          sx={{ width: '100%', height: '100%' }}
          value={selectedDate}
          onChange={handleDateChange}
        />
      </div>
    </LocalizationProvider>
  );
}
