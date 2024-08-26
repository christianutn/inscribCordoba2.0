import { Typography } from "@mui/material";


const SubtituloPrincipal = ({ texto, fontWeight, variant }) => {
    return (
        <Typography
            className="subtitulo-principal"
            variant={variant || 'h5'}
            color="text.primary"
            style={{
                fontWeight: parseInt(fontWeight) || 'bold', // Aplicar fontWeight dinámicamente
            }}
        >
            {texto}
        </Typography>
    );
}

export default SubtituloPrincipal;
