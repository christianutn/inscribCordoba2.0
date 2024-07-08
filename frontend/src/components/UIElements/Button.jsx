import Button from '@mui/material/Button';

const MyButton = ({mensaje, type, width, hanldeOnClick}) => {

    return(
        <Button variant="contained" type={type} sx={{ width: width || "100%" }} onClick={hanldeOnClick}>{mensaje}</Button> 
    )
}

export default MyButton