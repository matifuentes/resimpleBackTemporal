import BaseLine from '../../../models/Base-Line.js'
import UserCompany from "../../../models/User-Company.js"
import Company from '../../../models/Company.js'
import generatePDF from '../../../services/generatePDF/generatePDF.js'
import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch';

//TODO: Falta agregar validaciones
const controllerAddBaseLine = async (root, args) => {
  const { idUser, idCompany } = args

  // * Validar match Manager y Company
  const filterMatch = { idUser, idCompany };
  const matchManagerCompany = await UserCompany.findOne(filterMatch)

  if (matchManagerCompany === null) {
    throw new Error('La company no está asociada al usuario')
  }

  // * Validar que la company tenga idRETC
  const filterCompany = { _id: idCompany }
  const dataCompany = await Company.findOne(filterCompany)

  if (dataCompany.idRETC === null || dataCompany.idRETC == '') {
    throw new Error('No tiene ID RETC')
  }

  // * Validar que la company tenga una idRETC valida
  if (dataCompany.statusRETC != 'Validado') {
    throw new Error('La ID RETC no es válida')
  }

  // * Agregar idRETC y rutCompany como argumento validado de la BaseLine
  args.idRETC = dataCompany.idRETC
  args.rutCompany = dataCompany.rutCompany

  const baseLine = new BaseLine({ ...args })

  // * Validaciones

  // * Generar PDF
  const genPDF = await generatePDF(baseLine)

  baseLine.pdfUrl = genPDF.nameFile

  // * Enviar mail
  const { emailManager, nameManager } = baseLine;

  const response = await fetch(`${process.env.ENVIRONMENT_URL}/api/send-email/welcome`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      mail: emailManager,
      name: nameManager
      // pdf: genPDF.nameFile
    }),
  });

  await response.json();

  // * Borrar PDF de carpeta PDFS
  fs.unlinkSync(`${path.resolve()}/apiServices/company/services/generatePDF/pdfs/${genPDF.nameFile}`);

  return await baseLine.save()
}

export default controllerAddBaseLine