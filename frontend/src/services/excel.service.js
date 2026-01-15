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



export const descargarExcelCronograma = async (data, columns, nameFile) => {
    // Validar entradas básicas
    if (!Array.isArray(data) || !Array.isArray(columns)) {
        console.error('Error: "data" y "columns" deben ser arrays.');
        return; // Salir si los datos no son válidos
    }
    if (columns.length === 0) {
        console.error('Error: El array "columns" no puede estar vacío.');
        return;
    }

    // --- NUEVO: Ordenar los datos ---
    // Crear una copia para no modificar el array original (buena práctica)
    const sortedData = [...data];

    // Ordenar la copia por "Fecha inicio del curso" ascendente
    sortedData.sort((a, b) => {
        // Intentar convertir las fechas string a objetos Date
        // Asumimos el formato "YYYY-MM-DD"
        const dateA = new Date(a["Fecha inicio del curso"]);
        const dateB = new Date(b["Fecha inicio del curso"]);

        // Manejar posibles fechas inválidas o faltantes (opcional, pero robusto)
        // Si a falta o es inválida, va al final. Si b falta o es inválida, va al final.
        const timeA = !isNaN(dateA.getTime()) ? dateA.getTime() : Infinity;
        const timeB = !isNaN(dateB.getTime()) ? dateB.getTime() : Infinity;

        return timeA - timeB; // Orden ascendente (fecha más antigua primero)
    });
    // ---------------------------------

    try {
        // 1. Crear Libro y Hoja
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Reporte');

        // 2. Definir Columnas
        worksheet.columns = columns.map((headerString) => ({
            header: headerString,
            key: headerString,
            width: 20,
            // style: { alignment: { vertical: 'top', horizontal: 'left', wrapText: true } } // Descomenta para activar ajuste de texto
        }));

        // 3. Aplicar Estilo a la Fila de Cabecera
        const headerRow = worksheet.getRow(1);
        headerRow.font = { name: 'Calibri', size: 12, bold: true, color: { argb: 'FF000000' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 20;

        // 4. Agregar Filas de Datos (USANDO sortedData)
        // Iterar sobre los datos YA ORDENADOS
        sortedData.forEach((row) => { // <-- Usar sortedData aquí
            const addedRow = worksheet.addRow(row);
            // Opcional: Aplicar estilo a las celdas de datos
            // addedRow.font = { name: 'Calibri', size: 11 };
            // addedRow.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
        });

        // 5. Ajustar Ancho de Columnas (Opcional)
        /* // Descomenta si quieres probar el autoajuste
        worksheet.columns.forEach(column => {
          // ... (código de autoajuste como en el ejemplo anterior)
        });
        */

        // 6. Generar el Buffer del Archivo Excel
        const buffer = await workbook.xlsx.writeBuffer();

        // 7. Crear Blob y Disparar la Descarga en el Navegador
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nameFile || 'ReporteCronogramaOrdenado.xlsx'; // Nombre de archivo sugerido
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // 8. Limpiar la URL del objeto
        window.URL.revokeObjectURL(url);


    } catch (error) {
        console.error('Error detallado al generar el archivo Excel ordenado:', error);
        // alert('Hubo un error al generar el reporte Excel ordenado. Por favor, inténtalo de nuevo.');
    }
};