import React, { useState, useMemo } from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, 
    InputAdornment, Paper, List, ListItem, ListItemText, Typography, CircularProgress, Chip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const ReasignarModal = ({ open, onClose, onReasign, loading, selectedRowData, adminUsers }) => {
    const [userSearchTerm, setUserSearchTerm] = useState('');
    const [selectedUserForReasign, setSelectedUserForReasign] = useState(null);

    const filteredAdminUsersForModal = useMemo(() => {
        // Filtrar usuarios para que solo sean ADM y estén activos (activo = 1 o true)
        const validUsers = adminUsers.filter(user => user.rol === 'ADM' && (user.activo === 1 || user.activo === true));

        if (!userSearchTerm) return validUsers;
        const term = userSearchTerm.toLowerCase();
        return validUsers.filter(user =>
            (user.detalle_persona?.nombre?.toLowerCase() || '').includes(term) ||
            (user.detalle_persona?.apellido?.toLowerCase() || '').includes(term) ||
            (user.cuil?.toLowerCase() || '').includes(term)
        );
    }, [adminUsers, userSearchTerm]);

    const handleConfirm = () => {
        if (selectedUserForReasign) {
            onReasign(selectedUserForReasign);
        }
    };

    const handleClose = () => {
        setSelectedUserForReasign(null);
        setUserSearchTerm('');
        onClose();
    }

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>Reasignar Instancia de Curso</DialogTitle>
            <DialogContent dividers>
                {selectedRowData && (
                    <>
                        <Typography gutterBottom>Curso: <strong>{selectedRowData["Nombre del curso"]}</strong> ({selectedRowData["Código del curso"]})</Typography>
                        <Typography gutterBottom>Asignado actual: <strong>{selectedRowData["Asignado"]}</strong></Typography>
                    </>
                )}
                <TextField 
                    fullWidth 
                    variant="outlined" 
                    size="small" 
                    label="Buscar usuario ADM (Nombre, Apellido, CUIL)" 
                    value={userSearchTerm} 
                    onChange={(e) => setUserSearchTerm(e.target.value)} 
                    sx={{ my: 2 }} 
                    InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>),}}/>
                <Paper sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid lightgrey' }}>
                    <List dense>
                        {/* Opción de Sin Asignar */}
                        {!userSearchTerm && (
                           <ListItem 
                                button 
                                selected={selectedUserForReasign?.cuil === null} 
                                onClick={() => setSelectedUserForReasign({ cuil: null, detalle_persona: { nombre: 'Sin', apellido: 'asignar' } })}
                                sx={{ borderBottom: '1px solid #eee', bgcolor: 'rgba(0, 0, 0, 0.02)' }}
                            >
                                <ListItemText 
                                    primary="Sin asignar" 
                                    secondary="Dejar la instancia sin un administrador responsable"
                                    primaryTypographyProps={{ fontWeight: 'bold', color: 'error.main' }} 
                                />
                                {selectedUserForReasign?.cuil === null && <Chip label="Seleccionado" color="primary" size="small" />}
                            </ListItem>
                        )}

                        {filteredAdminUsersForModal.length === 0 && !userSearchTerm && <ListItem><ListItemText primary="No se encontraron usuarios ADM." /></ListItem>}
                        {filteredAdminUsersForModal.map(user => (
                            <ListItem key={user.cuil} button selected={selectedUserForReasign?.cuil === user.cuil} onClick={() => setSelectedUserForReasign(user)}>
                                <ListItemText primary={`${user.detalle_persona?.nombre || ''} ${user.detalle_persona?.apellido || ''} - Cuil: ${user.cuil}`} primaryTypographyProps={{ fontWeight: 500, wordBreak: 'break-word', color: "black" }} />
                                {selectedUserForReasign?.cuil === user.cuil && <Chip label="Seleccionado" color="primary" size="small" />}
                            </ListItem>
                        ))}
                    </List>
                </Paper>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancelar</Button>
                <Button 
                    onClick={handleConfirm} 
                    variant="contained" 
                    color="primary" 
                    disabled={(selectedUserForReasign === null) || loading}
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : "Confirmar Reasignación"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReasignarModal;
