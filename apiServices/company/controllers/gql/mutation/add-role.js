import Role from "../../../models/Role.js"

//TODO: Falta agregar validaciones
const controllerAddRole = async (root, args) => {
  const role = new Role({ ...args })

  return await role.save()
}

export default controllerAddRole