import bcrypt from 'bcrypt'
import { validateRegister } from '../../../validations/company.js'
import { rutValidator, gen6digitsNumber } from "../../../utils.js"
import TemporalCompany from "../../../models/TemporalCompany.js"
import User from "../../../models/User.js"

const controllerAddTemporalCompany = async (root, args) => {
  const temporalCompany = new TemporalCompany({ ...args })

  // * Validar campos
  const { error } = validateRegister.validate(args, { abortEarly: false })
  if (error) {
    throw new Error(error.details[0].message)
  }

  // * Validar RUT Manager y Company
  if (!rutValidator(temporalCompany.rutManager)) {
    throw new Error('Rut Administrador con formato inválido')
  }

  if (!rutValidator(temporalCompany.rutCompany)) {
    throw new Error('Rut Empresa con formato inválido')
  }

  // * Borrar el registro que coincida con el mail en la tabla TemporalCompany
  await TemporalCompany.findOneAndDelete({ emailManager: temporalCompany.emailManager.toLowerCase() });

  // * Validar si el correo ya existe en Users
  const existEmailUser = await User.findOne({ emailManager: temporalCompany.emailManager.toLowerCase() })
  if (existEmailUser) {
    throw new Error('Email ya registrado')
  }

  // * Hash de password
  const salt = await bcrypt.genSalt(10);
  temporalCompany.password = await bcrypt.hash(temporalCompany.password, salt)

  // * Generar random de 6 dígitos
  temporalCompany.validationCode = gen6digitsNumber();

  // * Guardar el email en minúscula
  temporalCompany.emailManager = temporalCompany.emailManager.toLowerCase();

  // * Guardar registro en BD y enviar correo
  try {
    const savedTemporalCompany = await temporalCompany.save()
    const { emailManager, nameManager, validationCode } = savedTemporalCompany;

    const response = await fetch(`${process.env.ENVIRONMENT_URL}/api/send-email/validate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mail: emailManager,
        name: nameManager,
        validationCode
      }),
    });

    await response.json();

    return {
      trying: 3,
      emailManager
    };
  } catch (error) {
    console.log(error)
  }
}

export default controllerAddTemporalCompany