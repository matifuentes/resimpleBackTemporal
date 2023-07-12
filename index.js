import express from 'express'
import bodyparser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config()

import validateTokenExpress from './middleware/validate-token-express.js'

const app = express();

import cors from 'cors'

// * CORS
app.use(cors());

// * Capturar body
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

// * Routes
import sendMail from './apiServices/company/routes/send-mail.js'
import mailTest from './apiServices/company/routes/mail-test.js'

// * Route middlewares
// app.use('/api/send-email', validateTokenExpress, mailValidateCode)
app.use('/api/send-email', sendMail)

if (process.env.ENVIRONMENT == 'DEV') {
    app.use('/api/send-email', mailTest)
}

app.get('/', (req, res) => {
    res.send('¡Hola Express!')
})

// * Iniciar server
const PORT = process.env.PORTEXPRESS || 3001;
app.listen(PORT, () => {
    console.log(`Servidor a su servicio en el puerto: ${PORT}`)
})