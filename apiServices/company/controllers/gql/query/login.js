import { validateLogin } from "../../../validations/company.js"
import User from "../../../models/User.js"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

const controllerLogin = async (root, args) => {
  const { emailManager, password } = args

  try {
    // * Validar campos
    const { error } = validateLogin.validate(args, { abortEarly: false })
    if (error) {
      throw new Error(error.details[0].message)
    }

    // * Validar que el correo exista en User
    const user = await User.findOne({ emailManager: emailManager.toLowerCase() })
    if (!user) {
      throw new Error('Credenciales inválidas')
    }

    // * Validar password
    const validatePassword = await bcrypt.compare(password, user.password);
    if (!validatePassword) {
      throw new Error('Credenciales inválidas')
    }

    // * Creación del JWT
    const token = jwt.sign({
      id: user._id,
      rutManager: user.rutManager,
      nameManager: user.nameManager,
      emailManager: user.emailManager
    }, process.env.TOKEN_SECRET);

    return {
      token: token
    }

  } catch (error) {
    return error
  }
}

export default controllerLogin