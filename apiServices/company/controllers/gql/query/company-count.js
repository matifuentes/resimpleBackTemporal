import Company from "../../../models/Company.js"

const controllerCompanyCount = async (root, args, { user }) => {
  try {
    if (!user) throw new Error('Usuario no autenticado')

    return Company.collection.countDocuments()
  } catch (error) {
    return error
  }
}

export default controllerCompanyCount