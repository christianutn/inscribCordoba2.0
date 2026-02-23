import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const EventoYCursoTable = ({ data, onEdit, onDelete }) => {
    const columns = [
        {
            field: 'cod',
            headerName: 'Código',
            width: 100
        },
        {
            field: 'nombre',
            headerName: 'Nombre Curso',
            flex: 1,
            minWidth: 200
        },
        {
            field: 'cupo',
            headerName: 'Cupo',
            width: 80,
            type: 'number'
        },
        {
            field: 'cantidad_horas',
            headerName: 'Horas',
            width: 80,
            type: 'number'
        },
        {
            field: 'tieneEvento',
            headerName: 'Evento',
            width: 120,
            renderCell: (params) => (
                <Chip
                    label={params.row.detalle_evento ? 'Con Evento' : 'Sin Evento'}
                    color={params.row.detalle_evento ? 'success' : 'warning'}
                    size="small"
                    variant={params.row.detalle_evento ? 'filled' : 'outlined'}
                />
            )
        },
        {
            field: 'perfil',
            headerName: 'Perfil',
            width: 150,
            valueGetter: (value, row) => row.detalle_evento?.detalle_perfil?.descripcion || '-'
        },
        {
            field: 'area_tematica',
            headerName: 'Área Temática',
            width: 150,
            valueGetter: (value, row) => row.detalle_evento?.detalle_areaTematica?.descripcion || '-'
        },
        {
            field: 'tipo_certificacion',
            headerName: 'Tipo Certificación',
            width: 180,
            valueGetter: (value, row) => row.detalle_evento?.detalle_tipoCertificacion?.descripcion || '-'
        },
        {
            field: 'certifica_en_cc',
            headerName: 'Certifica CC',
            width: 110,
            renderCell: (params) => {
                const evento = params.row.detalle_evento;
                if (!evento) return <Chip label="-" size="small" variant="outlined" />;
                return (
                    <Chip
                        label={evento.certifica_en_cc ? 'Sí' : 'No'}
                        color={evento.certifica_en_cc ? 'success' : 'default'}
                        size="small"
                    />
                );
            }
        },
        {
            field: 'esta_autorizado',
            headerName: 'Autorizado',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.row.esta_autorizado ? 'Sí' : 'No'}
                    color={params.row.esta_autorizado ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'esVigente',
            headerName: 'Vigente',
            width: 90,
            renderCell: (params) => (
                <Chip
                    label={params.row.esVigente ? 'Sí' : 'No'}
                    color={params.row.esVigente ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'actions',
            headerName: 'Acciones',
            width: 120,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box>
                    <Tooltip title="Editar">
                        <IconButton onClick={() => onEdit(params.row)} color="primary" size="small">
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    {params.row.detalle_evento && (
                        <Tooltip title="Eliminar Evento">
                            <IconButton onClick={() => onDelete(params.row)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.cod}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                density="compact"
            />
        </Box>
    );
};

export default EventoYCursoTable;
