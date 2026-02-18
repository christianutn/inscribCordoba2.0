import dotenv from 'dotenv';
import xlsx from 'xlsx';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

// Cargar variables de entorno
dotenv.config();

// __dirname para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Credenciales CiDi (tomadas del .env) ───────────────────────────────────
const CUIL_OPERADOR = process.env.CUIL_OPERADOR_PROD;
const HASH_COOKIE_OPERADOR = process.env.HASH_COOKIE_OPERADOR_PROD;
const ID_APLICATION = process.env.ID_APLICATION_PROD;
const CONTRASENIA = process.env.CONTRASENIA_PROD;
const KEY_APP = process.env.KEY_APP_PROD;
const URL_API = 'https://cuentacidi.cba.gov.ar/api/Usuario/Obtener_Usuario';

// ─── Helpers (basados en CidiService.js) ─────────────────────────────────────
function getTimeStamp() {
    const d = new Date();
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    const milliseconds = d.getMilliseconds().toString().padStart(3, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}${milliseconds}`;
}

function generateTokenValue(timeStamp, keyApp) {
    const dataToHash = timeStamp + keyApp.replace(/-/g, '');
    const hash = crypto.createHash('sha1');
    hash.update(dataToHash, 'utf8');
    return hash.digest('hex').toUpperCase();
}

async function obtenerEmailPorCuil(cuil) {
    const timeStamp = getTimeStamp();
    const tokenValue = generateTokenValue(timeStamp, KEY_APP);

    try {
        const response = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                TimeStamp: timeStamp,
                TokenValue: tokenValue,
                CUIL_OPERADOR,
                HASH_COOKIE_OPERADOR,
                IdAplicacion: ID_APLICATION,
                Contrasenia: CONTRASENIA,
                CUIL: String(cuil),
            }),
        });

        if (!response.ok) {
            console.error(`  ✖ HTTP ${response.status} para CUIL ${cuil}`);
            return null;
        }

        const data = await response.json();

        // Verificar que el usuario existe
        if (data?.Respuesta?.ExisteUsuario === 'S' && data.Email) {
            return data.Email;
        }

        console.warn(`  ⚠ CUIL ${cuil}: usuario no encontrado o sin email.`);
        return null;
    } catch (error) {
        console.error(`  ✖ Error consultando CUIL ${cuil}:`, error.message);
        return null;
    }
}

// ─── Función principal ───────────────────────────────────────────────────────
async function procesarExcel() {
    const filePath = path.join(__dirname, 'cuils.xlsx');
    console.log('═══════════════════════════════════════════════════');
    console.log('  Procesando archivo:', filePath);
    console.log('═══════════════════════════════════════════════════\n');

    // 1. Leer el archivo Excel
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // 2. Obtener los datos como JSON para saber cuántas filas hay
    const rows = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    if (rows.length < 2) {
        console.log('El archivo no tiene datos (solo encabezado o está vacío).');
        return;
    }

    // Escribir el encabezado "Email" en la columna B (B1)
    worksheet['B1'] = { t: 's', v: 'Email' };

    console.log(`  Total de CUILs a procesar: ${rows.length - 1}\n`);

    // 3. Recorrer cada fila (empezando desde la fila 2, índice 1)
    for (let i = 1; i < rows.length; i++) {
        const cuil = rows[i][0]; // Columna A

        if (!cuil) {
            console.log(`  Fila ${i + 1}: CUIL vacío, se omite.`);
            continue;
        }

        console.log(`  [${i}/${rows.length - 1}] Consultando CUIL: ${cuil}...`);

        const email = await obtenerEmailPorCuil(cuil);

        // Escribir el email en la columna B de la misma fila
        const cellRef = `B${i + 1}`; // i+1 porque las filas en xlsx son 1-indexed
        if (email) {
            worksheet[cellRef] = { t: 's', v: email };
            console.log(`    ✔ Email encontrado: ${email}`);
        } else {
            worksheet[cellRef] = { t: 's', v: 'NO ENCONTRADO' };
            console.log(`    ✖ Email no encontrado.`);
        }

        // Pequeña pausa para no saturar la API (300ms)
        await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // 4. Actualizar el rango de la hoja para incluir la nueva columna
    const range = xlsx.utils.decode_range(worksheet['!ref']);
    if (range.e.c < 1) range.e.c = 1; // Asegurar que incluya columna B
    worksheet['!ref'] = xlsx.utils.encode_range(range);

    // 5. Guardar el archivo modificado
    const outputPath = path.join(__dirname, 'cuils_con_emails.xlsx');
    xlsx.writeFile(workbook, outputPath);

    console.log('\n═══════════════════════════════════════════════════');
    console.log(`  ✔ Archivo guardado en: ${outputPath}`);
    console.log('═══════════════════════════════════════════════════');
}

// ─── Ejecutar ────────────────────────────────────────────────────────────────
procesarExcel().catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
});
