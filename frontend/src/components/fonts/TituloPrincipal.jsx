import { Typography } from "@mui/material";


const TituloPrincipal = ({ texto, fontWeight }) => {
    return (
        <Typography
            className="titulo-principal"
            variant="h4"
            color="text.primary"
            sx={{ 
                fontWeight: fontWeight || 700,
                fontFamily: "'Geogrotesque Sharp', sans-serif"
            }}
        >
            {texto}
        </Typography>
    );
}

export default TituloPrincipal;