/**
 * Script para ejecutar el monitoreo manualmente (fuera del CRON).
 * 
 * Uso (desde cualquier directorio):
 *   node backend/src/services/monitoring/run-monitoring-manual.js
 *   o desde backend/:
 *   node src/services/monitoring/run-monitoring-manual.js
 * 
 * Útil para:
 *   - Probar que el monitoreo funciona correctamente
 *   - Verificar después de un despliegue
 *   - Diagnosticar problemas de conectividad
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolver la ruta al .env del backend, sin importar desde dónde se ejecute
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../..', '.env');
dotenv.config({ path: envPath });

// Setear timezone igual que el sistema principal
process.env.TZ = 'America/Argentina/Buenos_Aires';

import runMonitoring from './monitoring.service.js';

const main = async () => {
    console.log('');
    console.log('🔧 Ejecutando monitoreo manual...');
    console.log('');

    const result = await runMonitoring();

    console.log('');
    console.log('📋 Resumen final:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');

    // Exit con código de error si hubo fallas
    if (result.failed > 0) {
        process.exit(1);
    }

    process.exit(0);
};

main();
