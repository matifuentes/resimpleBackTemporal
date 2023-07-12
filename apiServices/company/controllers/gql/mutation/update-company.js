import Company from "../../../models/Company.js"

const controllerUpdateCompany = async (root, args) => {
  const { _id, rutCompany, nameCompany, sizeCompany, idRETC, statusRETC } = args

  // * Validar size company y status RETC
  const validSizeCompany = ['Micro', 'Pequeña', 'Mediana', 'Grande']
  const validStatusRETC = ['En proceso', 'Validado', 'Rechazado']

  if (!validSizeCompany.includes(sizeCompany)) {
    throw new Error('El tamaño de la empresa es inválido')
  }

  if (!validStatusRETC.includes(statusRETC)) {
    throw new Error('El status RETC es inválido')
  }

  const filter = { _id };
  const update = { rutCompany, nameCompany, sizeCompany, idRETC, statusRETC }
  const updatedCompany = await Company.findOneAndUpdate(filter, update, { new: true }, { runValidators: true })

  return updatedCompany
}

export default controllerUpdateCompany