require('dotenv').config()

const jwt = require('jsonwebtoken')
const JWT_RESET_KEY = process.env.JWT_RESET_KEY

const User = require('../models/user')

exports.gotoReset = (req, res) => {
  const { token } = req.params

  if (token) {
    jwt.verify(token, JWT_RESET_KEY, (err, decodedToken) => {
      if (err) {
        req.flash('error_msg', 'Incorrect or expired link! Please try again.')
        res.redirect('/auth/login')
      } else {
        const { _id } = decodedToken
        User.findById(_id, (err, user) => {
          if (err) {
            req.flash(
              'error_msg',
              'User with email ID does not exist! Please try again.',
            )
            res.redirect('/auth/login')
          } else {
            res.redirect(`/auth/reset/${_id}`)
          }
        })
      }
    })
  } else {
    console.log('Password reset error!')
  }
}
