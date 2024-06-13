function validarCUIL(cuil) {
    const regex = /^(20|23|24|27)[0-9]{8}[0-9]$/;
    return regex.test(cuil);
  }

export default validarCUIL