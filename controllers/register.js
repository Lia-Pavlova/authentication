const nodemailer = require('nodemailer')
const { google } = require('googleapis')
const OAuth2 = google.auth.OAuth2
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground'

require('dotenv').config()

const jwt = require('jsonwebtoken')

const {
  JWT_SECRET_KEY,
  ADMIN_EMAIL,
  CLIENT_ID,
  CLIENT_SECRET,
  REFRESH_TOKEN,
} = process.env

const User = require('../models/user')

exports.registerHandle = (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = []

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' })
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' })
  }

  if (password.length < 8) {
    errors.push({ msg: 'Password must be at least 8 characters' })
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2,
    })
  } else {
    User.findOne({ email: email }).then((user) => {
      if (user) {
        errors.push({ msg: 'Email ID already registered' })
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2,
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

        const token = jwt.sign({ name, email, password }, JWT_SECRET_KEY, {
          expiresIn: '10m',
        })
        const CLIENT_URL = 'http://' + req.headers.host

        const output = `
                <h3>Please click on below link to activate your account</h3>
                <p>${CLIENT_URL}/auth/activate/${token}</p>
                <p><b>NOTE: </b> The above activation link expires in 10 minutes.</p>
                `

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
          subject: 'Account Verification: Authentication ✔',
          generateTextFromHTML: true,
          html: output,
        }

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error)
            req.flash(
              'error_msg',
              'Something went wrong on our end. Please register again.',
            )
            res.redirect('/auth/login')
          } else {
            console.log('Mail sent : %s', info.response)
            req.flash(
              'success_msg',
              'Activation link sent to email ID. Please activate to log in.',
            )
            res.redirect('/auth/login')
          }
        })
      }
    })
  }
}
