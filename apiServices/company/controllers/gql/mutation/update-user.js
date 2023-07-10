import User from "../../../models/User.js"

const controllerUpdateUser = async (root, args) => {
  const { _id, rutManager, nameManager, emailManager, role, status } = args

  // * Validar rol y status
  const validRoles = ['Invitado', 'Administrador', 'Representante Legal']
  const validStatus = ['Pendiente', 'Activo', 'Inactivo']

  if (!validRoles.includes(role)) {
    throw new Error('El rol es inválido')
  }

  if (!validStatus.includes(status)) {
    throw new Error('El status es inválido')
  }

  const filter = { _id };
  const update = { rutManager, nameManager, emailManager, role, status }
  const updatedUser = await User.findOneAndUpdate(filter, update, { new: true })

  return updatedUser
}

export default controllerUpdateUser