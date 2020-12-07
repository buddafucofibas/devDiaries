const mongoose = require('mongoose')

const authorSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
  },
})

authorSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

module.exports = mongoose.model('Author', authorSchema)
