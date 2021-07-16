// imports
const express = require('express')
const mongoose = require('mongoose')
const methodOverride = require('method-override')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
const indexRouter = require('./routes/index')
const authorRouter = require('./routes/author')
const postRouter = require('./routes/post')

// create app
const app = express()

// configure .env file
require('dotenv').config()

// set up port
const port = process.env.PORT || 3000

// connect to database
const uri = process.env.ATLAS_URI
mongoose.connect(
  uri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  },
  () => {
    console.log('connected to database via Atlas')
  }
)

// set up sessions
app.use(
  session({
    secret: 'bruh',
    resave: false,
    saveUninitialized: false,
  })
)

// configure app to parse req.body data and allow cross-origin resource sharing
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

// set static file location
app.use(express.static(path.join(__dirname, 'public')))

// set method override using a query value
app.use(methodOverride('_method'))

// login check
const checkLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  next()
}

// set view engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// setup routes
app.use('/', indexRouter)
app.use('/authors', checkLogin, authorRouter)
app.use('/posts', checkLogin, postRouter)

app.listen(port)

// console.clear()
// const test = path.join(__dirname, './uploads/image.png')
// console.log(test)
