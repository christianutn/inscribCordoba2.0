import Fab from '@mui/material/Fab';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import AddIcon from '@mui/icons-material/Add';



const FabAlargado = ({ mensaje, onClick, icon, justifyContent }) => {


    return (
        <div className='fab-alargado' style={{ display: 'flex', justifyContent: 'flex-end' || justifyContent}}>
            <Fab className={icon} variant="extended" size="small" color="primary"
                sx={{
                    fontSize: 14,
                    '& .MuiFab-icon': {
                        fontSize: 14, // Ajusta el tamaño del icono
                    },
                    height: 30, // Ajusta la altura del botón
                    minHeight: 30, // Asegúrate de que la altura mínima del botón sea 30
                    padding: '0 10px', // Ajusta el padding del botón
                    display: 'flex',
                    
                    
                }}
                onClick={onClick}>
                {
                    icon === "verAutorizador" && <VisibilityIcon sx={{ mr: 1 }}></VisibilityIcon>
                }
                {
                    icon === "agregar" && <PersonAddIcon sx={{ mr: 1 }}></PersonAddIcon>
                }
                {
                    icon === "quitar" && <PersonRemoveIcon sx={{ mr: 1 }}></PersonRemoveIcon>
                }
                {
                    icon === "signoMas" && <AddIcon sx={{ mr: 1 }}></AddIcon>
                }
                {mensaje || "Agregar mensaje"}
            </Fab>
        </div>
    )
}

export default FabAlargado