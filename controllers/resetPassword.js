const bcryptjs = require('bcryptjs')

const User = require('../models/user')

exports.resetPassword = (req, res) => {
  var { password, password2 } = req.body
  const id = req.params.id
  let errors = []

  if (!password || !password2) {
    req.flash('error_msg', 'Please enter all fields.')
    res.redirect(`/auth/reset/${id}`)
  } else if (password.length < 8) {
    req.flash('error_msg', 'Password must be at least 8 characters.')
    res.redirect(`/auth/reset/${id}`)
  } else if (password != password2) {
    req.flash('error_msg', 'Passwords do not match.')
    res.redirect(`/auth/reset/${id}`)
  } else {
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(password, salt, (err, hash) => {
        if (err) throw err
        password = hash

        User.findByIdAndUpdate({ _id: id }, { password }, function (
          err,
          result,
        ) {
          if (err) {
            req.flash('error_msg', 'Error resetting password!')
            res.redirect(`/auth/reset/${id}`)
          } else {
            req.flash('success_msg', 'Password reset successfully!')
            res.redirect('/auth/login')
          }
        })
      })
    })
  }
}
