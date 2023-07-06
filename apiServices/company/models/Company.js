import mongoose from 'mongoose'

const companySchema = mongoose.Schema({
  rutCompany: {
    type: String,
    required: true,
    max: 12,
  },
  nameCompany: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  sizeCompany: {
    type: String,
    required: true,
    enum: ['Micro', 'Pequeña', 'Mediana', 'Grande'],
  },
  idRETC: {
    type: String,
    required: false,
    max: 256,
  },
  statusRETC: {
    type: String,
    required: false,
    max: 32,
    enum: ['En proceso', 'Validado', 'Rechazado']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Company', companySchema)