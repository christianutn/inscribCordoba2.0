import ExcelJS from 'exceljs';

export const descargarExcel = async (data, columns, nameFile) => {
    try {
        // Crear un nuevo libro de trabajo y una hoja de cálculo
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        // Definir las columnas en el archivo xlsx basadas en el array 'columns'
        worksheet.columns = columns.map((col) => ({
            header: col.headerName,
            key: col.field,
            width: 15, // Puedes ajustar el ancho según sea necesario
        }));

        // Agregar los datos a la hoja de cálculo
        data.forEach((row) => {
            // Crear una nueva fila con los valores según los campos definidos en 'columns'
            const newRow = {};
            columns.forEach((col) => {
                newRow[col.field] = row[col.field];
            });
            worksheet.addRow(newRow);
        });

        // Crear un buffer para el archivo
        const blob = await workbook.xlsx.writeBuffer();
        
        // Crear una URL para el blob y descargar el archivo
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = nameFile || 'archivoDescargado.xlsx';
        link.click();
        
        // Limpiar el URL del objeto
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
    }
};

