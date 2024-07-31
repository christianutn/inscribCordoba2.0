import React from 'react';
import { Box, Card, Typography, Avatar, Divider } from '@mui/material';
import { styled } from '@mui/system';
import Subtitulo from "./fonts/SubtituloPrincipal"

const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 'none', // Ajustar esto según sea necesario
  padding: theme.spacing(2),
  margin: 0, // Eliminar el centrado automático
}));

const StyledCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  boxShadow: 'none',
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
}));

const Details = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  marginLeft: theme.spacing(2),
}));

/* const tutors = [
  { name: 'John Doe Bergero', rol: "Profesor con permiso de edición", initials: 'JD' },
  { name: 'Jane Doette', rol:"Profesor con permiso de edición", initials: 'JD' },
  { name: 'Xin Yue', rol: "Profesor con permiso de edición", initials: 'XY' },
]; */



const TutoresSeleccionados = ({tutors}) => {
  return (
    <Root>
      <Subtitulo texto="Tutores Seleccionados" variant={"h6"} fontWeight={"100"}></Subtitulo>
      <Divider sx={{ marginBottom: 2, borderBottomWidth: 2, borderColor: 'black' }} />
      {tutors && tutors.map((tutor, index) => (
        <Box key={index}>
          <StyledCard>
            <AvatarContainer>
              <Avatar>{tutor.initials}</Avatar>
              <Details>
                <Typography variant="body1">{tutor.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {tutor.rol} 
                </Typography>
              </Details>
            </AvatarContainer>
            
          </StyledCard>
          <Divider />
        </Box>
      ))}
    </Root>
  );
};

export default TutoresSeleccionados;
