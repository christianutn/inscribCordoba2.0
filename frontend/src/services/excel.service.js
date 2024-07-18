import ExcelJS from 'exceljs';

export const descargarExcel = async (data, cabecera) => {
    try {
        

        // Crear un nuevo libro de trabajo y una hoja de cálculo
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Cursos');

       

        // Definir las columnas en el archivo xlsx
        worksheet.columns = cabecera;

        // Agregar los datos a la hoja de cálculo
        data.forEach((curso) => {
            worksheet.addRow(curso);
        });

        // Crear un buffer para el archivo
        const blob = await workbook.xlsx.writeBuffer();
        
        // Crear una URL para el blob y descargar el archivo
        const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'cursos.xlsx';
        link.click();
        
        // Limpiar el URL del objeto
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error al generar el archivo Excel:', error);
    }
};
