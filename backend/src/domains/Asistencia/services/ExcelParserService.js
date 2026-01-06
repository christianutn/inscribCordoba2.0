import xlsx from 'xlsx';

class ExcelParserService {
  constructor() { }

  parse(buffer) {

    const workbook = xlsx.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const nroEvento = worksheet['C4'] ? worksheet['C4'].v : null;
    const nombreCurso = worksheet['C5'] ? worksheet['C5'].v : null;
    const nombreDocente = worksheet['C6'] ? worksheet['C6'].v : null;
    const fechaDesde = `${xlsx.SSF.parse_date_code(worksheet['C7'].v).y}-${String(xlsx.SSF.parse_date_code(worksheet['C7'].v).m).padStart(2, '0')}-${String(xlsx.SSF.parse_date_code(worksheet['C7'].v).d).padStart(2, '0')}`;
    const fechaHasta = `${xlsx.SSF.parse_date_code(worksheet['C8'].v).y}-${String(xlsx.SSF.parse_date_code(worksheet['C8'].v).m).padStart(2, '0')}-${String(xlsx.SSF.parse_date_code(worksheet['C8'].v).d).padStart(2, '0')}`;
    const horario = worksheet['F6'] ? worksheet['F6'].v : null;

    const participantes = this.extractParticipantes(worksheet);
    const diasEvento = this.extractDiasEvento(worksheet);

    return {
      nroEvento,
      nombreCurso,
      nombreDocente,
      fechaDesde,
      fechaHasta,
      horario,
      participantes,
      diasEvento,
    };
  }

  extractParticipantes(worksheet) {
    const participantes = [];
    let rowIndex = 10; // Data starts from row 10 as row 9 is the header
    while (worksheet[`B${rowIndex}`]) {
      const cuilRaw = worksheet[`B${rowIndex}`].v;
      const cuil = String(cuilRaw).replace(/-/g, '');

      const nombreCompleto = worksheet[`C${rowIndex}`].v;
      const [apellido, ...nombresArr] = nombreCompleto.split(',');
      const nombres = nombresArr.join(',').trim();

      const reparticion = worksheet[`D${rowIndex}`] ? worksheet[`D${rowIndex}`].v : '';

      participantes.push({
        cuil,
        apellido: this.tratarNombre(apellido),
        nombres: this.tratarNombre(nombres),
        reparticion,
      });
      rowIndex++;
    }
    return participantes;
  }

  extractDiasEvento(worksheet) {
    const dias = [];
    const startColumn = 'H';
    let colIndex = xlsx.utils.decode_col(startColumn);
    const rowIndex = 9; // Header row for dates

    while (true) {
      const cellAddress = xlsx.utils.encode_cell({ c: colIndex, r: rowIndex - 1 });
      const cell = worksheet[cellAddress];

      if (!cell || typeof cell.v !== 'number') { // Dates in xlsx are numbers, stop if not a number
        break;
      }

      const date = xlsx.SSF.parse_date_code(cell.v);
      const formattedDate = `${date.y}-${String(date.m).padStart(2, '0')}-${String(date.d).padStart(2, '0')}`;
      dias.push(formattedDate);
      colIndex++;
    }
    return dias;
  }

  tratarNombre(nombre) {
    if (!nombre) return '';
    return nombre
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export default ExcelParserService;