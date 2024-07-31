import React from 'react';
import { Box, Card, Typography, Avatar, Button, Divider } from '@mui/material';
import { styled } from '@mui/system';

const Root = styled(Box)(({ theme }) => ({
  width: '100%',
  maxWidth: 500,
  margin: 'auto',
  padding: theme.spacing(2),
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

const tutors = [
  { name: 'John Doe', friends: 2, initials: 'JD' },
  { name: 'Jane Doette', friends: 14, initials: 'JD' },
  { name: 'Xin Yue', friends: 22, initials: 'XY' },
];

const TutoresSeleccionados = () => {
  return (
    <Root>
      <Typography variant="h6" gutterBottom>
        Tutores seleccionados
      </Typography>
      <Divider sx={{ marginBottom: 2 }} />
      {tutors.map((tutor, index) => (
        <Box key={index}>
          <StyledCard>
            <AvatarContainer>
              <Avatar>{tutor.initials}</Avatar>
              <Details>
                <Typography variant="body1">{tutor.name}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {tutor.friends} friends
                </Typography>
              </Details>
            </AvatarContainer>
            <Button variant="outlined" color="primary">
              ADD FRIEND
            </Button>
          </StyledCard>
          <Divider />
        </Box>
      ))}
    </Root>
  );
};

export default TutoresSeleccionados;



