const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')

require('dotenv').config()

const app = express()

require('./config/passport')(passport)

const db = process.env.MONGODB_URI

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Successfully connected to MongoDB'))
  .catch((err) => console.log(err))

app.use(expressLayouts)
app.use('/assets', express.static('./assets'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({ extended: false }))

app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  }),
)

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())

app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')
  res.locals.error = req.flash('error')
  next()
})

app.use('/', require('./routes/index'))
app.use('/auth', require('./routes/auth'))

const PORT = process.env.PORT || 3003

app.listen(PORT, console.log(`Server running on PORT ${PORT}`))
