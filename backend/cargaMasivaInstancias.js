import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';
import sequelize from './src/config/database.js';
import Instancia from './src/domains/Inscribcordoba/api/models/instancia.models.js';
import Curso from './src/domains/Inscribcordoba/api/models/curso.models.js';

// Para obtener el directorio en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Rutas a los archivos
const mergePath = path.join(__dirname, 'merge.xlsx');
const verPath = path.join(__dirname, 'ver.xlsx');

/**
 * Función para transformar las fechas de formato serial (Excel) o JS Date a 'YYYY-MM-DD'
 */
const formatDate = (date) => {
    if (!date) return null;
    if (typeof date === 'string') {
        // En caso de que venga como un string (ej. "30/05/2026") o ya en formato de fecha
        const parts = date.split('/');
        if (parts.length === 3) {
            // Asumimos MM/DD/YY o DD/MM/YYYY según el Excel, pero usando cellDates true
            // Esto raran vez pasa si forzamos el cellDates
        }
        return date;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split('T')[0];
};

async function ejecutarCargaMasiva() {
    console.log("Iniciando carga masiva de instancias...");
    let t;
    let errorFila = null;
    let errorDato = null;

    try {
        // 1. Leer los archivos Excel
        console.log("Leyendo archivos merge.xlsx y ver.xlsx...");

        const wbMerge = xlsx.readFile(mergePath, { cellDates: true });
        // Tomamos siempre la primera hoja del archivo
        const sheetMerge = wbMerge.Sheets[wbMerge.SheetNames[0]];
        const dataMerge = xlsx.utils.sheet_to_json(sheetMerge);

        const wbVer = xlsx.readFile(verPath);
        const sheetVer = wbVer.Sheets[wbVer.SheetNames[0]];
        const dataVer = xlsx.utils.sheet_to_json(sheetVer);

        // Mapear ver.xlsx para una búsqueda más rápida a lo largo del proceso.
        // Asume que la columna en ver es 'cod'
        const verMap = new Map();
        for (const row of dataVer) {
            if (row.cod) {
                // Guardamos el primer registro de cada código que aparezca
                if (!verMap.has(String(row.cod).trim())) {
                    verMap.set(String(row.cod).trim(), row);
                }
            }
        }

        // 2. Iniciar Transacción
        t = await sequelize.transaction();

        console.log(`Se procesarán ${dataMerge.length} filas del archivo merge.xlsx (excluyendo cabecera).`);

        let nuevosCursosCreados = 0;
        let instanciasCreadas = 0;

        // 3. Procesar cada fila de merge.xlsx
        for (let i = 0; i < dataMerge.length; i++) {
            errorFila = i + 2; // +2 por índice cero y cabecera
            const row = dataMerge[i];
            errorDato = row;
            const cursoCod = row.curso ? String(row.curso).trim() : null;

            if (!cursoCod) {
                console.log(`- Fila ${i + 2} omitida: Columna "curso" vacía.`);
                continue; // Saltar si el código es nulo
            }

            // 3.1 Buscar por la columna "curso" en la tabla cursos de la base de datos
            const cursoExistente = await Curso.findByPk(cursoCod, { transaction: t });

            if (!cursoExistente) {
                // Si el curso no existe, debemos buscarlo en ver.xlsx

                const verRow = verMap.get(cursoCod);
                if (!verRow) {
                    throw new Error(`El curso "${cursoCod}" no fue hallado en la Base de Datos, y tampoco se encuentra en "ver.xlsx" (Fila Merge: ${i + 2}). No se puede crear.`);
                }

                // Generamos un nuevo curso siguiendo los atributos indicados
                const nuevoCursoData = {
                    cod: verRow.cod,
                    nombre: verRow.nombre,
                    cupo: 1,
                    cantidad_horas: 1,
                    medio_inscripcion: 'OTRO',
                    plataforma_dictado: 'CC', // Antes era 'PCC', pero no existe en plataformas_dictado
                    tipo_capacitacion: 'EL',
                    area: 'AGEN',
                    esVigente: 0,
                    tiene_evento_creado: 0,
                    es_autogestionado: 0,
                    tiene_restriccion_edad: 0,
                    tiene_restriccion_departamento: 0,
                    publica_pcc: 1,
                    tiene_correlatividad: 0,
                    esta_maquetado: 1,
                    esta_configurado: 1,
                    aplica_sincronizacion_certificados: 1,
                    url_curso: null, // Como lo exiges en formato nulo
                    esta_autorizado: 0,
                    tiene_formulario_evento_creado: 0
                };

                console.log(`\t > Creando curso faltante para la instancia: Código: ${cursoCod} Nombre: ${verRow.nombre}`);
                await Curso.create(nuevoCursoData, { transaction: t });
                nuevosCursosCreados++;
            }

            // Carga y adaptación de la instancia
            // Los campos definen fechas y posiblemente deban normalizarse.
            const dateFields = [
                'fecha_inicio_curso',
                'fecha_fin_curso',
                'fecha_inicio_inscripcion',
                'fecha_fin_inscripcion',
                'fecha_suba_certificados'
            ];

            const nuevaInstanciaData = { ...row };

            // Reemplazo de las propiedades de tipo fecha por formato String adecuado
            for (const field of dateFields) {
                if (nuevaInstanciaData[field]) {
                    nuevaInstanciaData[field] = formatDate(nuevaInstanciaData[field]);
                }
            }

            // 3.2 Crear la nueva instancia, se asume que cada atributo coincide con el nombre de la columna como mencionaste.
            await Instancia.create(nuevaInstanciaData, { transaction: t });
            instanciasCreadas++;
        }

        // Si todo salio bien en el bucle
        await t.commit();

        console.log("\n-------------------------------------------------");
        console.log("✅ ¡Carga masiva completada exitosamente!");
        console.log(`🔹 Cursos nuevos creados: ${nuevosCursosCreados}`);
        console.log(`🔹 Instancias creadas: ${instanciasCreadas}`);
        console.log("-------------------------------------------------");

    } catch (error) {
        // En caso de error, el script hace Rollback y emite aviso.
        if (t) {
            console.log("\n⚠️ Ocurrió un error en la ejecución. Deshaciendo cambios en la BD (Rollback)...");
            await t.rollback();
            console.log("🔙 Rollback completado correctamente.");
        }
        console.error("\n=== MENSAJE DE ERROR ===");
        if (errorFila) {
            console.error(`❌ Error al intentar procesar la Fila ${errorFila} de merge.xlsx`);
            console.error(`📄 Datos de la fila que originó el problema:`, errorDato);
        }
        console.error("\nDetalle:", error.message);
        if (error.original) {
            console.error("Detalle desde Base de Datos:", error.original.sqlMessage || error.original);
        }
        console.error("\nPor favor corrige el problema y vuelve a correr este script.");
    } finally {
        await sequelize.close();
        console.log("Conexión a la base de datos cerrada.");
    }
}

ejecutarCargaMasiva();
