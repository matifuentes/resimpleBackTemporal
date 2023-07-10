import User from "../../../models/User.js"
import { validateAddUser } from "../../../validations/company.js"
import { rutValidator, generatePassword } from "../../../utils.js"
import bcrypt from 'bcrypt'

const controllerAddUser = async (root, args) => {
  const user = new User({ ...args })

  // * Generar password random
  console.log('PASSWORD GENERADA', generatePassword())

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

  // * Hash de password
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt)

  // * Guardar el mail en minúscula
  user.emailManager = user.emailManager.toLowerCase();

  return await user.save()
}

export default controllerAddUser