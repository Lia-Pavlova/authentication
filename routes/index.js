const express = require('express')
const router = express.Router()
const { ensureAuthenticated } = require('../config/checkAuth')

router.get('/', (req, res) => {
  res.render('welcome')
})
router.get('/dashboard', ensureAuthenticated, (req, res) =>
  res.render('dash', {
    name: req.user.name,
  }),
)

module.exports = router
