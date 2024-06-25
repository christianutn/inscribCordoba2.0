import Button from '@mui/material/Button';

const MyButton = ({mensaje, type, handle}) => {

    return(
        <Button variant="contained" type={type} sx={{ width: '100%' }}>{mensaje}</Button> // <Button variant="contained" type={type} sx={{ width: '100%' }} onClick={hanlde}>{mensaje}</Button>
    )
}

export default MyButton