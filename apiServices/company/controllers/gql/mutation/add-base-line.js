import BaseLine from "../../../models/Base-Line.js"

//TODO: Falta agregar validaciones
const controllerAddBaseLine = async (root, args) => {
  const baseLine = new BaseLine({ ...args })

  return await baseLine.save()
}

export default controllerAddBaseLine