import React, { useEffect, useState } from 'react';
import { getAvisos } from '../services/avisos.service';
import { Card, CardContent, Typography, Box } from '@mui/material';
import DOMPurify from 'dompurify'; // para sanitizar el HTML

const MostrarAvisos = () => {
  const [avisos, setAvisos] = useState([]);

  useEffect(() => {
    const fetchAvisos = async () => {
      try {
        const data = await getAvisos();
        const visibles = data.filter(a => a.visible); // solo los visibles
        setAvisos(visibles);
      } catch (error) {
        console.error('Error al cargar avisos:', error);
      }
    };

    fetchAvisos();
  }, []);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {avisos.map((aviso) => (
        <Card key={aviso.id} sx={{ boxShadow: 3 }}>
          <CardContent>
            <Typography variant="h5" component="div">
              {aviso.icono} {aviso.titulo}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {formatearFecha(aviso.created_at)}
            </Typography>
            <Box
              sx={{ mt: 2 }}
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(aviso.contenido)
              }}
            />
          </CardContent>
        </Card>
      ))}
    </Box>
  );
};

export default MostrarAvisos;
