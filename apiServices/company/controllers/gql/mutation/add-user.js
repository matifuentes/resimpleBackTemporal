import User from "../../../models/User.js"
import { validateAddUser } from "../../../validations/company.js"
import { rutValidator, generatePassword } from "../../../utils.js"
import bcrypt from 'bcrypt'

const controllerAddUser = async (root, args) => {
  const user = new User({ ...args })

  // * Validar campos
  const { error } = validateAddUser.validate(args, { abortEarly: false })
  if (error) {
    throw new Error(error.details[0].message)
  }

  // * Validar RUT Manager y Company
  if (!rutValidator(user.rutManager)) {
    throw new Error('Rut Administrador con formato inválido')
  }

  // * Validar si existe el mail del usuario
  const existEmailUser = await User.findOne({ emailManager: user.emailManager.toLowerCase() })
  if (existEmailUser) {
    throw new Error('El email ya está registrado')
  }

  // * Generar password random
  const unhashedPassword = generatePassword()
  console.log('PASSWORD GENERADA', unhashedPassword)

  // * Hash de password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(unhashedPassword, salt)

  // * Guardar el mail en minúscula
  user.emailManager = user.emailManager.toLowerCase();

  // * Guardar registro en BD y enviar correo
  try {
    const savedUser = await user.save()
    const { emailManager, nameManager } = savedUser;

    const response = await fetch(`${process.env.ENVIRONMENT_URL}/api/send-email/add-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mail: emailManager,
        name: nameManager,
        password: unhashedPassword
      }),
    });

    await response.json();

    return {
      status: "Usuario creado con éxito",
      emailManager,
      password: unhashedPassword
    };
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

export default controllerAddUser