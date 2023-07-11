import Company from "../../../models/Company.js"
import { rutValidator } from "../../../utils.js"
import { validateAddCompany } from "../../../validations/company.js"

const controllerAddCompanyRS = async (root, args) => {
  const company = new Company({ ...args })

  // * Validar campos
  const { error } = validateAddCompany.validate(args, { abortEarly: false })
  if (error) {
    throw new Error(error.details[0].message)
  }

  // * Validar RUT Company
  if (!rutValidator(company.rutCompany)) {
    throw new Error('Rut de Empresa con formato inválido')
  }

  return await company.save()
}

export default controllerAddCompanyRS