import Button from '@mui/material/Button';

const MyButton = ({ mensaje, type, width, hanldeOnClick, disabled }) => {

    return (
        <Button className='button' variant="contained" type={type} /*sx={{ width: width || "100%"}}*/ onClick={hanldeOnClick} disabled={disabled}>{mensaje}</Button>
    )
}

export default MyButton