import React, { useState } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Alert, FormControl, FormLabel, RadioGroup,
    FormControlLabel, Radio, Checkbox
} from '@mui/material';

/**
 * Modal reutilizable para configurar la descarga de Excel.
 * 
 * Props:
 * - open: boolean - controla si el modal está abierto
 * - onClose: function - callback al cerrar el modal
 * - onDownload: function({ plataforma, incluirCancelados }) - callback al confirmar descarga
 * - infoMessage: string (opcional) - mensaje informativo mostrado en el Alert
 */
const ExcelDownloadModal = ({
    open,
    onClose,
    onDownload,
    infoMessage = 'Los filtros activos en la pantalla ya están siendo aplicados a esta descarga.'
}) => {
    const [filterPlataforma, setFilterPlataforma] = useState('ALL');
    const [incluirCancelados, setIncluirCancelados] = useState(false);

    const handleClose = () => {
        // Resetear los filtros al cerrar
        setFilterPlataforma('ALL');
        setIncluirCancelados(false);
        onClose();
    };

    const handleDownload = () => {
        onDownload({
            plataforma: filterPlataforma,
            incluirCancelados
        });
        // Resetear los filtros después de la descarga
        setFilterPlataforma('ALL');
        setIncluirCancelados(false);
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>Configurar Descarga Excel</DialogTitle>
            <DialogContent dividers>
                <Alert severity="info" sx={{ mb: 3 }}>
                    {infoMessage}
                </Alert>

                <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
                    <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>Filtro de Plataforma</FormLabel>
                    <RadioGroup
                        value={filterPlataforma}
                        onChange={(e) => setFilterPlataforma(e.target.value)}
                    >
                        <FormControlLabel value="ALL" control={<Radio color="primary" />} label="Todas las plataformas" />
                        <FormControlLabel value="CC" control={<Radio color="primary" />} label="Solo Moodle Campus Córdoba (CC)" />
                        <FormControlLabel value="EXT" control={<Radio color="primary" />} label="Solo Plataforma Externa (EXT)" />
                    </RadioGroup>
                </FormControl>

                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <FormLabel component="legend" sx={{ fontWeight: 'bold', color: 'text.primary', mb: 1 }}>Cursos Cancelados</FormLabel>
                    <FormControlLabel
                        control={<Checkbox checked={incluirCancelados} onChange={(e) => setIncluirCancelados(e.target.checked)} color="primary" />}
                        label="Incluir cursos que figuran como Cancelados"
                    />
                </FormControl>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={handleClose} color="inherit" sx={{ textTransform: 'none', fontWeight: 500 }}>Cancelar</Button>
                <Button onClick={handleDownload} variant="contained" color="primary" sx={{ textTransform: 'none', px: 3 }}>
                    Descargar Archivo
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ExcelDownloadModal;
