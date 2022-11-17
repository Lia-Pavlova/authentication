const bcryptjs = require('bcryptjs')

require('dotenv').config()

const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const User = require('../models/user')

exports.activateHandle = (req, res) => {
  const token = req.params.token
  let errors = []
  if (token) {
    jwt.verify(token, JWT_SECRET_KEY, (err, decodedToken) => {
      if (err) {
        req.flash(
          'error_msg',
          'Incorrect or expired link! Please register again.',
        )
        res.redirect('/auth/register')
      } else {
        const { name, email, password } = decodedToken
        User.findOne({ email: email }).then((user) => {
          if (user) {
            req.flash(
              'error_msg',
              'Email ID already registered! Please log in.',
            )
            res.redirect('/auth/login')
          } else {
            const newUser = new User({
              name,
              email,
              password,
            })

            bcryptjs.genSalt(10, (err, salt) => {
              bcryptjs.hash(newUser.password, salt, (err, hash) => {
                if (err) throw err
                newUser.password = hash
                newUser
                  .save()
                  .then((user) => {
                    req.flash(
                      'success_msg',
                      'Account activated. You can now log in.',
                    )
                    res.redirect('/auth/login')
                  })
                  .catch((err) => console.log(err))
              })
            })
          }
        })
      }
    })
  } else {
    console.log('Account activation error!')
  }
}
