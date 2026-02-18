import React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const EventoYCursoTable = ({ data, onEdit, onDelete }) => {
    const columns = [
        {
            field: 'curso',
            headerName: 'Código',
            width: 100
        },
        {
            field: 'cursoNombre',
            headerName: 'Nombre Curso',
            flex: 1,
            minWidth: 200,
            valueGetter: (value, row) => row.detalle_curso?.nombre || row.curso
        },
        {
            field: 'cupo',
            headerName: 'Cupo',
            width: 80,
            type: 'number',
            valueGetter: (value, row) => row.detalle_curso?.cupo || 'N/A'
        },
        {
            field: 'cantidad_horas',
            headerName: 'Horas',
            width: 80,
            type: 'number',
            valueGetter: (value, row) => row.detalle_curso?.cantidad_horas || 'N/A'
        },
        {
            field: 'perfil',
            headerName: 'Perfil',
            width: 150,
            valueGetter: (value, row) => row.detalle_perfil?.descripcion || 'N/A'
        },
        {
            field: 'area_tematica',
            headerName: 'Área Temática',
            width: 150,
            valueGetter: (value, row) => row.detalle_areaTematica?.descripcion || 'N/A'
        },
        {
            field: 'tipo_certificacion',
            headerName: 'Tipo Certificación',
            width: 180,
            valueGetter: (value, row) => row.detalle_tipoCertificacion?.descripcion || 'N/A'
        },
        {
            field: 'certifica_en_cc',
            headerName: 'Certifica CC',
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.row.certifica_en_cc ? 'Sí' : 'No'}
                    color={params.row.certifica_en_cc ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'esta_autorizado',
            headerName: 'Autorizado',
            width: 100,
            renderCell: (params) => (
                <Chip
                    label={params.row.detalle_curso?.esta_autorizado ? 'Sí' : 'No'}
                    color={params.row.detalle_curso?.esta_autorizado ? 'success' : 'default'}
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
                    label={params.row.detalle_curso?.esVigente ? 'Sí' : 'No'}
                    color={params.row.detalle_curso?.esVigente ? 'success' : 'default'}
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
                    <Tooltip title="Eliminar">
                        <IconButton onClick={() => onDelete(params.row)} color="error" size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={data}
                columns={columns}
                getRowId={(row) => row.curso}
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
