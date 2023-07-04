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
import mailValidateCode from './apiServices/company/routes/mail-validate-code.js'
import mailTest from './apiServices/company/routes/mail-test.js'

// * Route middlewares
// app.use('/api/send-email', validateTokenExpress, mailValidateCode)
app.use('/api/send-email', mailValidateCode)

if (process.env.ENVIRONMENT == 'DEV') {
    app.use('/api/send-email', mailTest)
}

app.get('/', (req, res) => {
    res.send('¡Hola Express!')
})

// * Iniciar server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor a su servicio en el puerto: ${PORT}`)
})