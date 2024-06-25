import Fab from '@mui/material/Fab';
import VisibilityIcon from '@mui/icons-material/Visibility';


const FabAlargado = () => {

    return(
        <Fab variant="extended" size="small" color="primary" sx={{ fontSize: 9 }}>
                    <VisibilityIcon sx={{ mr: 1 }}></VisibilityIcon>
                    Ver cursos autorizados
                </Fab>
    )
}

export default FabAlargado