import { Typography } from "@mui/material";

const TituloPrincipal = ({texto, fontWeight}) => {
    return (
        <Typography
            className="titulo-principal"
            variant="h3"
            color="text.primary"
            sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: fontWeight || 'bold'
            }}
        >
            {texto}
        </Typography>
    );
}
export default TituloPrincipal