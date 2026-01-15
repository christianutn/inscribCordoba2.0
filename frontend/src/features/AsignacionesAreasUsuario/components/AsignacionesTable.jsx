import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Chip, Tooltip } from '@mui/material';

const AsignacionesTable = ({ data, onDelete }) => {
    // Transform data: Group by user (cuil) and collect all their areas
    const transformedData = useMemo(() => {
        return data.reduce((acc, asignacion) => {
            if (!asignacion.detalle_usuario || !asignacion.detalle_area) {
                console.warn("Asignación incompleta omitida:", asignacion);
                return acc;
            }

            const cuil = asignacion.detalle_usuario.cuil;
            const existingRow = acc.find(row => row.cuil === cuil);

            if (existingRow) {
                // Add area to existing user row
                existingRow.areasAsignadas.push({
                    cod: asignacion.detalle_area.cod,
                    nombre: asignacion.detalle_area.nombre,
                    comentario: asignacion.comentario || ''
                });
            } else {
                // Create new user row
                const persona = asignacion.detalle_usuario.detalle_persona;
                acc.push({
                    id: cuil,
                    cuil: cuil,
                    nombre: persona?.nombre || 'N/A',
                    apellido: persona?.apellido || 'N/A',
                    areasAsignadas: [{
                        cod: asignacion.detalle_area.cod,
                        nombre: asignacion.detalle_area.nombre,
                        comentario: asignacion.comentario || ''
                    }]
                });
            }
            return acc;
        }, []);
    }, [data]);

    const columns = [
        {
            field: 'cuil',
            headerName: 'CUIL',
            width: 150
        },
        {
            field: 'nombre',
            headerName: 'Nombre',
            width: 150
        },
        {
            field: 'apellido',
            headerName: 'Apellido',
            width: 150
        },
        {
            field: 'areasAsignadas',
            headerName: 'Áreas Asignadas',
            flex: 1,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box
                    sx={{
                        display: 'flex',
                        gap: 0.5,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        p: 0.5,
                        maxHeight: '100px',
                        overflowY: 'auto'
                    }}
                >
                    {params.value.map((area) => (
                        <Tooltip
                            key={area.cod}
                            title={`${area.nombre}${area.comentario ? ` - ${area.comentario}` : ''}`}
                            placement="top"
                            arrow
                        >
                            <Chip
                                label={area.nombre}
                                onDelete={() => onDelete({
                                    cuil_usuario: params.row.cuil,
                                    cod_area: area.cod
                                })}
                                size="small"
                                sx={{
                                    '& .MuiChip-label': {
                                        maxWidth: '120px',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }
                                }}
                            />
                        </Tooltip>
                    ))}
                </Box>
            )
        }
    ];

    return (
        <Box sx={{ height: 600, width: '100%' }}>
            <DataGrid
                rows={transformedData}
                columns={columns}
                getRowId={(row) => row.cuil}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                density="compact"
                getRowHeight={() => 'auto'}
                sx={{
                    '& .MuiDataGrid-cell': {
                        py: 1
                    }
                }}
            />
        </Box>
    );
};

export default AsignacionesTable;
