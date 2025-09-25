import React, { useState, useEffect } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, 
    Box, FormControlLabel, Checkbox, Typography, CircularProgress, Autocomplete as MuiAutocomplete
} from '@mui/material';

const GestionarRestriccionesModal = ({ open, onClose, onUpdate, loading, selectedRowData, allDepartamentos, allCursos }) => {
    const [editableDepartamentos, setEditableDepartamentos] = useState([]);
    const [editableCorrelativos, setEditableCorrelativos] = useState([]);
    const [edadRestrictionEnabled, setEdadRestrictionEnabled] = useState(false);
    const [editableEdadDesde, setEditableEdadDesde] = useState('');
    const [editableEdadHasta, setEditableEdadHasta] = useState('');

    useEffect(() => {
        if (open && selectedRowData) {
            const { originalInstancia } = selectedRowData;
            const currentDeps = originalInstancia.detalle_restricciones_por_departamento || [];
            const currentCorrs = originalInstancia.detalle_restricciones_por_correlatividad || [];
            
            setEditableDepartamentos(currentDeps.map(d => allDepartamentos.find(ad => ad.id === d.departamento_id)).filter(Boolean));
            setEditableCorrelativos(currentCorrs.map(c => allCursos.find(ac => ac.cod === c.curso_correlativo)).filter(Boolean));
            setEdadRestrictionEnabled(!!originalInstancia.tiene_restriccion_edad);
            setEditableEdadDesde(originalInstancia.restriccion_edad_desde || '');
            setEditableEdadHasta(originalInstancia.restriccion_edad_hasta || '');
        } else if (!open) {
            setEditableDepartamentos([]);
            setEditableCorrelativos([]);
            setEdadRestrictionEnabled(false);
            setEditableEdadDesde('');
            setEditableEdadHasta('');
        }
    }, [open, selectedRowData, allDepartamentos, allCursos]);

    const handleEdadRestrictionChange = (event) => {
        const isChecked = event.target.checked;
        setEdadRestrictionEnabled(isChecked);
        if (isChecked) {
            setEditableEdadDesde('16');
        } else {
            setEditableEdadDesde('');
            setEditableEdadHasta('');
        }
    };

    const handleConfirm = () => {
        const payload = {
            tiene_restriccion_departamento: editableDepartamentos.length > 0 ? 1 : 0,
            departamentos: editableDepartamentos.map(d => d.id),
            tiene_correlatividad: editableCorrelativos.length > 0 ? 1 : 0,
            cursos_correlativos: editableCorrelativos.map(c => c.cod),
            tiene_restriccion_edad: edadRestrictionEnabled ? 1 : 0,
            restriccion_edad_desde: edadRestrictionEnabled ? (parseInt(editableEdadDesde, 10) || null) : null,
            restriccion_edad_hasta: edadRestrictionEnabled ? (parseInt(editableEdadHasta, 10) || null) : null,
        };
        onUpdate(payload);
    };

    const isInvalid = edadRestrictionEnabled && (
        (editableEdadDesde && parseInt(editableEdadDesde, 10) < 16) ||
        (editableEdadHasta && editableEdadDesde && parseInt(editableEdadHasta, 10) < parseInt(editableEdadDesde, 10))
    );

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>Gestionar Restricciones</DialogTitle>
            <DialogContent dividers>
                <Typography gutterBottom>Curso: <strong>{selectedRowData?.["Nombre del curso"]}</strong></Typography>
                <Stack spacing={4} sx={{ pt: 2 }}>
                    <Box>
                        <FormControlLabel
                            control={<Checkbox checked={edadRestrictionEnabled} onChange={handleEdadRestrictionChange} />}
                            label="Aplicar restricción por edad"
                        />
                        <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                            <TextField
                                label="Edad Desde"
                                type="number"
                                value={editableEdadDesde}
                                onChange={(e) => setEditableEdadDesde(e.target.value)}
                                onBlur={(e) => {
                                    const value = parseInt(e.target.value, 10);
                                    if (edadRestrictionEnabled && (!value || value < 16)) {
                                        setEditableEdadDesde('16');
                                    }
                                }}
                                disabled={!edadRestrictionEnabled}
                                fullWidth
                                inputProps={{ min: 16 }}
                                error={edadRestrictionEnabled && editableEdadDesde && parseInt(editableEdadDesde, 10) < 16}
                                helperText={edadRestrictionEnabled && editableEdadDesde && parseInt(editableEdadDesde, 10) < 16 ? "La edad mínima por defecto es 16." : ""}
                            />
                            <TextField
                                label="Edad Hasta"
                                type="number"
                                value={editableEdadHasta}
                                onChange={(e) => setEditableEdadHasta(e.target.value)}
                                disabled={!edadRestrictionEnabled}
                                fullWidth
                                inputProps={{ min: editableEdadDesde ? parseInt(editableEdadDesde, 10) : 16 }}
                                error={edadRestrictionEnabled && editableEdadHasta && editableEdadDesde && parseInt(editableEdadHasta, 10) < parseInt(editableEdadDesde, 10)}
                                helperText={edadRestrictionEnabled && editableEdadHasta && editableEdadDesde && parseInt(editableEdadHasta, 10) < parseInt(editableEdadDesde, 10) ? "Debe ser mayor o igual a la edad 'desde'." : ""}
                            />
                        </Stack>
                    </Box>
                    <MuiAutocomplete
                        multiple
                        options={allDepartamentos}
                        getOptionLabel={(option) => option.nombre || ''}
                        value={editableDepartamentos}
                        onChange={(event, newValue) => setEditableDepartamentos(newValue)}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => <TextField {...params} label="Restringir por Departamento" placeholder="Seleccionar..." />}
                    />
                    <MuiAutocomplete
                        multiple
                        options={allCursos}
                        getOptionLabel={(option) => option.nombre || ''}
                        value={editableCorrelativos}
                        onChange={(event, newValue) => setEditableCorrelativos(newValue)}
                        isOptionEqualToValue={(option, value) => option.cod === value.cod}
                        renderInput={(params) => <TextField {...params} label="Restringir por Correlatividad" placeholder="Seleccionar..." />}
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleConfirm} variant="contained" disabled={loading || isInvalid}>
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Guardar Restricciones"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default GestionarRestriccionesModal;