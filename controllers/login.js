const passport = require('passport')

exports.loginHandle = (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true,
  })(req, res, next)
}
