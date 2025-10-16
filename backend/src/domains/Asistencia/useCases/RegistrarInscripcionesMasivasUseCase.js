import ExcelParserService from '../services/ExcelParserService.js';

class RegistrarInscripcionesMasivasUseCase {
  constructor() {
    this.excelParserService = new ExcelParserService();
  }

  async execute(fileBuffer) {
    try {
      const data = this.excelParserService.parse(fileBuffer);

      // TODO: Lógica para guardar datos en la base de datos.
      console.log('Datos extraídos del Excel:', data);

      return {
        success: true,
        message: 'Archivo procesado exitosamente.',
        data: data
      };
    } catch (error) {
      console.error('Error procesando el archivo:', error);
      return {
        success: false,
        message: 'Ocurrió un error al procesar el archivo.',
        error: error.message
      };
    }
  }
}

export default RegistrarInscripcionesMasivasUseCase;
