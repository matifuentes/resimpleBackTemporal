import express from 'express'
import controllerMailTest from '../controllers/mail-test.js';

const router = express.Router()

router.post('/test', controllerMailTest);

export default router