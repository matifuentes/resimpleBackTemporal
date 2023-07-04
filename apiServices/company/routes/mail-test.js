import express from 'express'
import mailer from '../../../services/mailer/mailer.js'

const router = express.Router()

router.post('/test', async (req, res) => {
  const { mail, name, verificationCode } = req.body

  // * Agregar las options para el envío
  const mailOptions = {
    from: `ReSimple <${process.env.EMAIL_SENDER}>`,
    to: mail,
    subject: 'Mail de prueba',
    template: 'pruebita',
    context: {
      name,
      verificationCode
    },
    attachments: [
      {
        filename: 'dummy1.pdf',
        path: './pdfs/prueba.pdf'
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
});

export default router