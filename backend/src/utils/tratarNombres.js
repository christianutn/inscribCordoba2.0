function tratarNombres(nombre) {
    nombre = nombre.trim(); // Eliminar espacios al principio y al final

    // Reemplazar múltiples espacios por uno solo
    nombre = nombre.replace(/\s+/g, ' ');

    // Convertir la primera letra de cada palabra a mayúscula
    nombre = nombre.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    return nombre;
}

export default tratarNombres