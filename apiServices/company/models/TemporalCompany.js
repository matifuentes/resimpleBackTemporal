import mongoose from 'mongoose'

const temporalCompanySchema = mongoose.Schema({
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
  validationCode: {
    type: String,
    required: true,
    min: 6,
    max: 6,
  },
  trying: {
    type: Number,
    default: 3,
  },
  date: {
    type: Date,
    expires: 240,
    default: Date.now
  }
});

export default mongoose.model('Temporal-Company', temporalCompanySchema)