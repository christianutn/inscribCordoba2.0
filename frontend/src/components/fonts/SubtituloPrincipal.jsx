import { Typography } from "@mui/material";

const SubtituloPrincipal = ({ texto, fontWeight, variant }) => {
    return (
        <Typography
            className="subtitulo-principal"
            variant= {variant || 'h5'}
            color="text.primary"
            sx={{
                fontFamily: 'Roboto, sans-serif',
                fontWeight: parseInt(fontWeight) || 'bold'
            }}
        >
            {texto}
        </Typography>
    );
}
export default SubtituloPrincipal