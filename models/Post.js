const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    unique: true,
    required: true,
  },
  title: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  body: {
    type: String,
    trim: true,
    required: true,
    unique: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Post', postSchema)
