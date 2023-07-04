import express from 'express'
import mailer from '../../../services/mailer/mailer.js'

const router = express.Router()

router.post('/validate-code', async (req, res) => {
  const { mail, name, validationCode } = req.body

  console.log('validationCode', validationCode)

  // * Agregar las options para el envío
  const mailOptions = {
    from: `ReSimple <${process.env.EMAIL_SENDER}>`,
    to: mail,
    subject: 'Código de verificación',
    template: 'validate-code',
    context: {
      name,
      validationCode
    }
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