const validarFecha = (fecha) => {
    console.log("La fechas es: ", fecha)
    // Expresión regular para validar el formato AAAA-MM-DD
    const regexFecha = /^(19|20)\d\d-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/;
  
    // Validar formato básico
    if (!regexFecha.test(fecha)) {
      return false;
    }
    
    // Descomponer la fecha y verificar validez
    const [ano, mes, dia] = fecha.split('-').map(Number);
    const fechaObjeto = new Date(ano, mes - 1, dia);
    
    // Verificar que el objeto fecha corresponde a los valores originales
    return fechaObjeto.getFullYear() === ano && 
           fechaObjeto.getMonth() + 1 === mes && 
           fechaObjeto.getDate() === dia;
  }


  export default validarFecha