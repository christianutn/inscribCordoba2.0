function parseEsVigente(value) {
    if (value === true || value === "Si" || value === "si" || value === 1 || value === "1") return 1;
    if (value === false || value === "No" || value === "no" || value === 0 || value === "0") return 0;
    throw new Error("Valor de 'esVigente' inválido"); // Opcional: manejo de errores
}


export default parseEsVigente