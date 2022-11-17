const express = require('express')
const router = express.Router()

const registerHandle = require('../controllers/register')
const activateHandle = require('../controllers/activate')
const loginHandle = require('../controllers/login')
const forgotPassword = require('../controllers/forgotPassword')
const gotoReset = require('../controllers/gotoReset')
const resetPassword = require('../controllers/resetPassword')
const logoutHandle = require('../controllers/logout')

router.get('/login', (req, res) => res.render('login'))
router.get('/forgot', (req, res) => res.render('forgot'))
router.get('/reset/:id', (req, res) => {
  res.render('reset', { id: req.params.id })
})

router.get('/register', (req, res) => res.render('register'))
router.get('/activate/:token', activateHandle.activateHandle)
router.get('/forgot/:token', gotoReset.gotoReset)
router.get('/logout', logoutHandle.logoutHandle)

router.post('/register', registerHandle.registerHandle)
router.post('/forgot', forgotPassword.forgotPassword)
router.post('/reset/:id', resetPassword.resetPassword)
router.post('/login', loginHandle.loginHandle)

module.exports = router
