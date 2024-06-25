
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';

export default function FloatingActionButton() {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end', 
        '& > :not(style)': { m: 1 },
        width: '100%',
      }}
    >
      <Fab color="primary" aria-label="add">
        <AddIcon />
      </Fab>
    </Box>
  );
}
