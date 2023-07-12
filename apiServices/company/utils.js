const regexRut = /^[0-9]{8,9}-[0-9kK]{1}$/;
const weight = [2, 3, 4, 5, 6, 7];


// * Validador de RUT Chileno
const rutValidator = (rut) => {
  const rutLowerCase = rut.toLowerCase();
  const rutWithoutPoints = rutLowerCase.replace(/\./g, '');

  if (!regexRut.test(rutWithoutPoints)) {
    return false;
  }

  const [body, verificationDigit] = rutWithoutPoints.split('-');
  const sum = [...body].reverse().reduce((sum, curr, index) => sum + weight[index % weight.length] * curr, 0);

  const moduleEleven = 11 - (sum - (11 * Math.floor(sum / 11)));

  if (moduleEleven == 11) {
    return verificationDigit == 0;

  } else if (moduleEleven == 10) {
    return verificationDigit === 'k';

  } else {
    return parseInt(verificationDigit) === moduleEleven;
  }
}

// * Generador de 6 dígitos random
const gen6digitsNumber = () => {
  let min = 100000; // número mínimo de 6 dígitos
  let max = 999999; // número máximo de 6 dígitos
  let num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

// * Generador de password
const generatePassword = () => {
  var length = 16,
    charset = "abcdefghijklmnñopqrstuvwxyzABCDEFGHIJKLMNÑOPQRSTUVWXYZ0123456789¡!¿?@#$%&/=*.-_()[]{}",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

// * Generador de nombre PDF
const generateRandomNamePDF = () => {
  var length = 20,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

export { rutValidator, gen6digitsNumber, generatePassword, generateRandomNamePDF }