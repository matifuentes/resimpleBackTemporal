const regexRut = /^[0-9]{8,9}-[0-9kK]{1}$/;
const weight = [2, 3, 4, 5, 6, 7];

const RutValidator = (rut) => {
  const rutLowerCase = rut.toLowerCase();
  const rutWithoutPoints = rutLowerCase.replaceAll('.', '');

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

const gen6digitsNumber = () => {
  let min = 100000; // número mínimo de 6 dígitos
  let max = 999999; // número máximo de 6 dígitos
  let num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}

export { RutValidator, gen6digitsNumber }