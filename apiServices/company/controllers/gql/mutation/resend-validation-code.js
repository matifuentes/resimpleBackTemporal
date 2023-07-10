import fetch from 'node-fetch';
import { validateResendValidationCode } from "../../../validations/company.js"
import { gen6digitsNumber } from "../../../utils.js"
import TemporalCompany from "../../../models/TemporalCompany.js"
import User from "../../../models/User.js"

const controllerResendValidationCode = async (root, args) => {
  const temporalCompany = new TemporalCompany({ ...args })

  // * Validar Campos
  const { error } = validateResendValidationCode.validate(args, { abortEarly: false })
  if (error) {
    throw new Error(error.details[0].message)
  }

  // * Validar si el correo ya existe en Users
  const existEmailUser = await User.findOne({ emailManager: temporalCompany.emailManager.toLowerCase() })
  if (existEmailUser) {
    throw new Error('Email ya registrado')
  }

  // * Generar random de 6 dígitos
  const validationCodeGen = gen6digitsNumber();

  // * Actualizar data del usuario y enviar correo
  try {
    const filter = { emailManager: temporalCompany.emailManager.toLowerCase() };
    const update = { trying: 3, validationCode: validationCodeGen }
    const updatedTemporalCompany = await TemporalCompany.findOneAndUpdate(filter, update, { new: true });
    const { trying, emailManager, nameManager, validationCode } = updatedTemporalCompany;

    const response = await fetch(`${process.env.ENVIRONMENT_URL}/api/send-email/resend-validate-code`, {
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
      trying,
      emailManager
    }

  } catch (error) {
    console.log(error)
  }
}

export default controllerResendValidationCode