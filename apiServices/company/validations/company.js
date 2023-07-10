import Joi from '@hapi/joi'

const validateRegister = Joi.object({
  rutCompany: Joi.string().max(12).required(),
  nameCompany: Joi.string().min(6).max(255).required(),
  sizeCompany: Joi.string().valid('Micro', 'Pequeña', 'Mediana', 'Grande').required(),
  rutManager: Joi.string().max(12).required(),
  nameManager: Joi.string().min(6).max(255).required().messages({
    'string.empty': `"nameManager" No puede ser vacío`,
    'string.min': `"nameManager" El mínimo de caracteres es {#limit}`
  }),
  emailManager: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required()
});

const validateLogin = Joi.object({
  emailManager: Joi.string().min(6).max(255).required().email(),
  password: Joi.string().min(6).max(1024).required()
});

const validateResendValidationCode = Joi.object({
  emailManager: Joi.string().min(6).max(255).required().email().messages({
    'string.empty': `"emailManager" No puede ser vacío`,
    'string.email': `"emailManager" El formato no es válido`
  }),
});

const validateAddUser = Joi.object({
  rutManager: Joi.string().max(12).required(),
  nameManager: Joi.string().min(6).max(255).required().messages({
    'string.empty': `"nameManager" No puede ser vacío`,
    'string.min': `"nameManager" El mínimo de caracteres es {#limit}`
  }),
  emailManager: Joi.string().min(6).max(255).required().email(),
  role: Joi.string().min(6).max(255).required()
})

export { validateRegister, validateLogin, validateResendValidationCode, validateAddUser }