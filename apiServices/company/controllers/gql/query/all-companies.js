import Company from "../../../models/Company.js"

const controllerAllCompanies = async (root, args, { user }) => {
  try {
    if (!user) throw new Error('Usuario no autenticado')

    return Company.find({})
  } catch (error) {
    return error
  }
}

export default controllerAllCompanies