import mongoose from 'mongoose'

const Domiciliary = mongoose.Schema({
  codeSubCategory: {
    type: String,
    required: true,
    max: 32,
  },
  nameSubCategory: {
    type: String,
    required: true,
    max: 256,
  },
  codeClassificationMaterial: {
    type: String,
    required: true,
    max: 32,
  },
  nameClassificationMaterial: {
    type: String,
    required: true,
    max: 256,
  },
  codeMaterial: {
    type: String,
    required: true,
    max: 32,
  },
  nameMaterial: {
    type: String,
    required: true,
    max: 1024,
  },
  fullCode: {
    type: String,
    required: true,
    max: 32,
  },
  tonDangerous: {
    type: Number,
    required: true,
  },
  tonNotDangerous: {
    type: Number,
    required: true,
  },
  priceDangerous: {
    type: Number,
    required: true,
  },
  priceNotDangerous: {
    type: Number,
    required: true,
  }
});

const NoDomiciliary = mongoose.Schema({
  codeSubCategory: {
    type: String,
    required: true,
    max: 32,
  },
  nameSubCategory: {
    type: String,
    required: true,
    max: 256,
  },
  codeClassificationMaterial: {
    type: String,
    required: true,
    max: 32,
  },
  nameClassificationMaterial: {
    type: String,
    required: true,
    max: 256,
  },
  codeMaterial: {
    type: String,
    required: true,
    max: 32,
  },
  nameMaterial: {
    type: String,
    required: true,
    max: 1024,
  },
  fullCode: {
    type: String,
    required: true,
    max: 32,
  },
  tonDangerous: {
    type: Number,
    required: true,
  },
  tonNotDangerous: {
    type: Number,
    required: true,
  },
  priceDangerous: {
    type: Number,
    required: true,
  },
  priceNotDangerous: {
    type: Number,
    required: true,
  }
});

const baseLineSchema = mongoose.Schema({
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
  rutCompany: {
    type: String,
    required: true,
    max: 12,
  },
  idRETC: {
    type: String,
    required: true,
    max: 64,
  },
  registerType: {
    type: String,
    required: true,
    enum: ['Proyección', 'Corrección Proyección', 'Real', 'Corrección Real'],
  },
  period: {
    type: Number,
    required: true,
  },
  pdfUrl: {
    type: String,
    required: true,
    default: null,
  },
  isUploaded: {
    type: Boolean,
    required: true,
    default: false,
  },
  domiciliary: [Domiciliary],
  noDomiciliary: [NoDomiciliary],
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Base-Line', baseLineSchema)