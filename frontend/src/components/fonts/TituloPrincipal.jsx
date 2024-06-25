import { Typography } from "@mui/material";

const TituloPrincipal = ({texto}) => {
    return (
        <Typography
            className="titulo-principal"
            variant="h3"
            color="text.primary"
            sx={{
                fontFamily: 'Roboto Condensed, sans-serif',
                fontWeight: 'bold'
            }}
        >
            {texto}
        </Typography>
    );
}
export default TituloPrincipal