const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    resetLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true, versionKey: false },
)

const User = mongoose.model('user', userSchema)

module.exports = User
