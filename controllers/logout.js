exports.logoutHandle = (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.flash('success_msg', 'You are logged out')
    res.redirect('/auth/login')
  })
}
