import { Typography } from "@mui/material";


const TituloPrincipal = ({ texto, fontWeight }) => {
    return (
        <Typography 
            className="titulo-principal"
            variant="h3"
            color="text.primary"
            style={{ fontWeight: fontWeight || 'bold' }} // Aplicar fontWeight dinámicamente
        >
            {texto}
        </Typography>
    );
}

export default TituloPrincipal;