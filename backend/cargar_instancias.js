import fs from 'fs';
import csv from 'csv-parser';
import sequelize from './src/config/database.js';
import Instancia from './src/models/instancia.models.js';

async function importarCSV() {
  const transaction = await sequelize.transaction(); // Iniciamos transacción
  const registros = [];

  try {
    // Leemos CSV y lo guardamos temporalmente en memoria
    await new Promise((resolve, reject) => {
      fs.createReadStream('./instanciasSuba.csv')
        .pipe(csv())
        .on('data', (row) => {
          registros.push(row); // Guardamos cada fila como objeto {columna: valor}
        })
        .on('end', resolve)
        .on('error', reject);
    });

    // Insertamos cada fila en la base de datos
    for (const row of registros) {
      await Instancia.create({
        curso: row.curso,
        fecha_inicio_curso: row.fecha_inicio_curso,
        fecha_fin_curso: row.fecha_fin_curso,
        fecha_inicio_inscripcion: row.fecha_inicio_inscripcion,
        fecha_fin_inscripcion: row.fecha_fin_inscripcion,
        es_publicada_portal_cc:row.es_publicada_portal_cc,
        cupo:row.cupo,
        cantidad_horas:row.cantidad_horas,
        es_autogestionado:row.es_autogestionado,
        tiene_correlatividad:row.tiene_correlatividad,
        tiene_restriccion_edad:row.tiene_restriccion_edad,
        tiene_restriccion_departamento:row.tiene_restriccion_departamento,
        datos_solictud:row.datos_solictud,
        estado_instancia:row.estado_instancia,
        medio_inscripcion:row.medio_inscripcion,
        plataforma_dictado:row.plataforma_dictado,
        tipo_capacitacion:row.tipo_capacitacion,
        comentario:row.comentario,
        asignado:row.asignado,
        cantidad_inscriptos:row.cantidad_inscriptos,
        cantidad_certificados:row.cantidad_certificados,
        fecha_suba_certificados:row.fecha_suba_certificados,
        restriccion_edad_desde:row.restriccion_edad_desde,
        restriccion_edad_hasta:row.restriccion_edad_hasta,
      }, { transaction });
    }

    // Confirmamos la transacción
    await transaction.commit();
    console.log('Datos insertados correctamente');
  } catch (error) {
    // Si algo falla, hacemos rollback
    await transaction.rollback();
    console.error('Error al importar CSV:', error);
  }
}

importarCSV();
