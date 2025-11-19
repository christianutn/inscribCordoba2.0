import { google } from 'googleapis';
import stream from 'stream';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

dotenv.config();

const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

class GoogleDriveService {
    constructor() {
        this.jwtClient = new google.auth.JWT(
            process.env.GOOGLE_CLIENT_EMAIL,
            null,
            privateKey,
            ['https://www.googleapis.com/auth/drive']
        );
        this.drive = google.drive({ version: 'v3', auth: this.jwtClient });
        
        // Ruta base para uploads (funciona tanto en desarrollo como en Docker)
        this.uploadPath = path.join(process.cwd(), 'uploads', 'notas_de_autorizacion');
        
        // Crear carpeta si no existe
        if (!fs.existsSync(this.uploadPath)) {
            fs.mkdirSync(this.uploadPath, { recursive: true });
        }
    }

    async uploadFile(file, area, coordinador, id) {
        const bufferStream = new stream.PassThrough();
        bufferStream.end(file.buffer);

        const fileName = `${id}_${area}_${coordinador}.pdf`;

        const { data } = await this.drive.files.create({
            media: {
                mimeType: file.mimetype,
                body: bufferStream,
            },
            requestBody: {
                name: fileName,
                parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
            },
            fields: 'id, webViewLink',
            supportsAllDrives: true, // Necesario para subir archivos a Unidades Compartidas
        });
        
        return data;
    }
    
}

// --- Bloque de prueba para ejecutar con Node.js ---
// Este bloque solo se ejecutará si el archivo se corre directamente (ej: node GoogleDriveService.js)
// const test = () => {
//     (async () => {
//         console.log('Ejecutando prueba de GoogleDriveService...');

//         try {
//             // 1. Instanciar el servicio
//             const driveService = new GoogleDriveService();

//             // 2. Crear datos de prueba (mock)
//             const mockFile = {
//                 // Buffer.from simula el contenido binario de un archivo
//                 buffer: Buffer.from('Este es el contenido de un archivo de prueba simulando ser un PDF.'),
//                 mimetype: 'application/pdf', // Simulamos el mimetype de un PDF
//             };
//             const mockArea = 'AREA_TEST';
//             const mockCoordinador = 'COOR_TEST';
//             const mockId = `test_${Date.now()}`;

//             console.log(`Intentando subir archivo: ${mockId}_${mockArea}_${mockCoordinador}.pdf`);

//             // 3. Llamar al método de subida
//             const result = await driveService.uploadFile(mockFile, mockArea, mockCoordinador, mockId);

//             // 4. Mostrar el resultado si fue exitoso
//             console.log('¡Archivo subido exitosamente!');
//             console.log('Resultado de Google Drive:', result);

//         } catch (error) {
//             console.error('Ocurrió un error durante la prueba:', error);
//         }
//     })();
// }

// test();


export default GoogleDriveService;