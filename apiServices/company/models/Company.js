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
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Company', companySchema)