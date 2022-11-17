const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const { OAuth2 } = google.auth
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

require('dotenv').config()

const jwt = require('jsonwebtoken')
const {
  JWT_RESET_KEY,
  ADMIN_EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
} = process.env

const User = require('../models/user')

exports.forgotPassword = (req, res) => {
  const { email } = req.body

  let errors = []

  if (!email) {
    errors.push({ msg: 'Please enter an email ID' })
  }

  if (errors.length > 0) {
    res.render('forgot', {
      errors,
      email,
    })
  } else {
    User.findOne({ email: email }).then((user) => {
      if (!user) {
        errors.push({ msg: 'User with Email ID does not exist!' })
        res.render('forgot', {
          errors,
          email,
        })
      } else {
        const oauth2Client = new OAuth2(
          CLIENT_ID,
          CLIENT_SECRET,
          OAUTH_PLAYGROUND, // Redirect URL
        )

        oauth2Client.setCredentials({
          refresh_token: REFRESH_TOKEN,
        })
        const accessToken = oauth2Client.getAccessToken()

        const token = jwt.sign({ _id: user._id }, JWT_RESET_KEY, {
          expiresIn: '10m',
        })
        const CLIENT_URL = 'http://' + req.headers.host
        const output = `
                <h2>Please click on below link to reset your account password</h2>
                <p>${CLIENT_URL}/auth/forgot/${token}</p>
                <p><b>NOTE: </b> The activation link expires in 10 minutes.</p>
                `

        User.updateOne({ resetLink: token }, (err, success) => {
          if (err) {
            errors.push({ msg: 'Error resetting password!' })
            res.render('forgot', {
              errors,
              email,
            })
          } else {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                type: 'OAuth2',
                user: ADMIN_EMAIL,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken,
              },
            })

            const mailOptions = {
              from: ADMIN_EMAIL,
              to: email,
              subject: 'Account Password Reset ✔',
              html: output,
            }

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.log(error)
                req.flash(
                  'error_msg',
                  'Something went wrong on our end. Please try again later.',
                )
                res.redirect('/auth/forgot')
              } else {
                console.log('Mail sent : %s', info.response)
                req.flash(
                  'success_msg',
                  'Password reset link sent to email ID. Please follow the instructions.',
                )
                res.redirect('/auth/login')
              }
            })
          }
        })
      }
    })
  }
}
