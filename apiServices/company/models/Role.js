import mongoose from 'mongoose'

const Permission = mongoose.Schema({
  namePermission: {
    type: String,
    required: true,
    max: 256,
  },
  uriPermission: {
    type: String,
    required: false,
    max: 256,
  }
})

const roleSchema = mongoose.Schema({
  nameRole: {
    type: String,
    required: true,
  },
  permission: [Permission],
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Role', roleSchema)