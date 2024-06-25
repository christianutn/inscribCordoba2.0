import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import SubtituloPrincipal from './fonts/SubtituloPrincipal';



export default function Fecha({mensaje}) {
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>

            <div >

                <SubtituloPrincipal texto={mensaje} variant={'h6'} fontWeight={500}></SubtituloPrincipal>
                <DatePicker sx={{ width: '100%', height: '100%' }} />
            </div>

        </LocalizationProvider>
    );
}
