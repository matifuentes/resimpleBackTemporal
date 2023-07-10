import Company from "../../../models/Company.js"

const controllerUpdateCompany = async (root, args) => {
  const { _id, rutCompany, nameCompany, sizeCompany, idRETC, statusRETC } = args

  const filter = { _id: _id };
  const update = { rutCompany, nameCompany, sizeCompany, idRETC, statusRETC }
  const updatedCompany = await Company.findOneAndUpdate(filter, update, { new: true }, { runValidators: true })

  //TODO: Agregar validaciones a sizeCompany y statusRETC, ya que "enum" sólo funciona al crear y no al actualizar

  return updatedCompany
}

export default controllerUpdateCompany