
export const generarStringTutores =  (tutores) => {
    try {
        let stringTutores = "";
        for (let i = 0; i < tutores.length; i++) {
            const tutor = tutores[i]
            stringTutores += `${tutor.name} (${tutor.rol}), `;
        }

        // Eliminar la última coma y espacios
        stringTutores = stringTutores.replace(/,(\s*)$/, '');

        return stringTutores;
    } catch (error) {
        throw new Error(`Error al generar el string de tutores: ${error}`);
    }
}