import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
  rutManager: {
    type: String,
    required: true,
    max: 12,
  },
  nameManager: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  emailManager: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  role: {
    type: String,
    required: true,
    enum: ['Invitado', 'Administrador', 'Representante Legal'],
    default: 'Invitado',
  },
  status: {
    type: String,
    required: true,
    enum: ['Pendiente', 'Activo', 'Inactivo'],
    default: 'Activo'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema)