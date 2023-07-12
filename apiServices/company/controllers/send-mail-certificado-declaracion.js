import mailer from '../../../services/mailer/mailer.js'
import path from 'path'

const controllerSendMailCertificadoDeclaracion = async (req, res) => {
  const { mail, name, pdf } = req.body

  // * Agregar las options para el envío
  const mailOptions = {
    from: `ReSimple <${process.env.EMAIL_SENDER}>`,
    to: mail,
    subject: 'Certificado Declaración',
    template: 'certificado-declaracion',
    context: {
      title: 'Certificado Declaración',
      name
    },
    attachments: [
      {
        filename: 'CERTIFICADO-DECLARACION.pdf',
        path: `${path.resolve()}/apiServices/company/services/generatePDF/pdfs/${pdf}`
      }
    ]
  }

  // * Envío las options al mailer
  const result = await mailer(mailOptions)

  // * Retorno dependiendo si el envío se logra o no
  if (!result?.messageId) {
    return res.status(400).json({
      ok: false,
      data: {
        status: 'Error',
        message: 'No se pudo enviar el email'
      }
    })
  }

  return res.status(200).json({
    ok: true,
    data: {
      status: 'Success',
      message: 'Email enviado correctamente'
    }
  })
}

export default controllerSendMailCertificadoDeclaracion