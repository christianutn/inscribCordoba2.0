
import xlsx from 'xlsx';

class InscripcionExcelParser {
    constructor() {}

    parse(buffer) {
        const workbook = xlsx.read(buffer, { type: 'buffer', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        const nroEvento = this._getCell(worksheet, 'C4');
        const nombreCurso = this._getCell(worksheet, 'C5');
        const nombreDocente = this._getCell(worksheet, 'C6');
        const fechaDesde = this._getCell(worksheet, 'C7');
        const fechaHasta = this._getCell(worksheet, 'C8');
        const horario = this._getCell(worksheet, 'F6');

        const participantes = this._getParticipantes(worksheet);
        const diasEvento = this._getDiasEvento(worksheet);

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

    _getCell(worksheet, cellAddress) {
        const cell = worksheet[cellAddress];
        return cell ? cell.v : undefined;
    }

    _getParticipantes(worksheet) {
        const participantes = [];
        let rowIndex = 10; // Start from row 10 (Fila 10 in Excel)

        while (worksheet[`B${rowIndex}`]) {
            const cuilRaw = this._getCell(worksheet, `B${rowIndex}`);
            const cuil = cuilRaw ? String(cuilRaw).replace(/-/g, '') : '';

            const nombreCompleto = this._getCell(worksheet, `C${rowIndex}`);
            let apellido = '';
            let nombres = '';

            if (nombreCompleto) {
                const parts = nombreCompleto.split(',');
                apellido = parts[0] ? this._capitalize(parts[0].trim()) : '';
                nombres = parts[1] ? parts[1].trim() : '';
            }

            const reparticion = this._getCell(worksheet, `D${rowIndex}`) || '';

            if(cuil) { // Only add participant if CUIL exists
                participantes.push({
                    cuil,
                    apellido,
                    nombres,
                    reparticion,
                });
            }

            rowIndex++;
        }

        return participantes;
    }

    _getDiasEvento(worksheet) {
        const dias = [];
        let colIndex = 7; // 'H' is the 8th column (index 7)
        
        while (true) {
            const cellAddress = xlsx.utils.encode_cell({ r: 8, c: colIndex }); // Row 9 in Excel is index 8
            const cell = worksheet[cellAddress];

            if (cell && cell.t === 'd' && cell.v) {
                dias.push(cell.v);
                colIndex++;
            } else {
                break; // Stop when the cell is not a valid date
            }
        }
        return dias;
    }

    _capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
}

export default new InscripcionExcelParser();
