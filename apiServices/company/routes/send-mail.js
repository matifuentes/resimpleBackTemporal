import express from 'express'
import controllerSendMailValidateCode from '../controllers/send-mail-validate-code.js'
import controllerSendMailWelcome from '../controllers/send-mail-welcome.js';
import controllerResendMailValidateCode from '../controllers/resend-mail-validate-code.js';

const router = express.Router()

router.post('/validate-code', controllerSendMailValidateCode);
router.post('/resend-validate-code', controllerResendMailValidateCode);
router.post('/welcome', controllerSendMailWelcome);

export default router