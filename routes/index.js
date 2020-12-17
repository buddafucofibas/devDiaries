const express = require('express')
const { body, validationResult } = require('express-validator')
const Author = require('../models/Author')
const Post = require('../models/Post')
const bcrypt = require('bcrypt')
const saltRounds = 12
const router = express.Router()

// login check
const checkLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login')
  }
  next()
}

router.get('/', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/members')
  }
  res.render('home/home', { loggedOut: true })
})

router.get('/login', (req, res) => {
  if (req.session.user_id) {
    return res.redirect('/members')
  }
  res.render('home/login', { loggedOut: true })
})

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter valid email address'),
    body('password').isLength({ min: 1 }).withMessage('Password field cannot be empty'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const { email, password } = req.body
      const author = await Author.findOne({ email: email })
      if (!author) {
        console.log('Email not found, please register')
        return res.redirect('/register')
      }

      const match = await bcrypt.compare(password, author.password)
      if (!match) {
        console.log('invalid password')
        return res.redirect('/login')
      }

      req.session.user_id = author._id
      res.redirect('/members')
    } catch (err) {
      console.error(err)
    }
  }
)

router.get('/register', (req, res) => {
  res.render('home/register', { loggedOut: true })
})

router.post(
  '/register',
  [
    body('firstName').isLength({ min: 1 }).withMessage('First name must have at least 1 character'),
    body('lastName').isLength({ min: 1 }).withMessage('Last name must have at least 1 character'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters in length'),
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    if (req.body.password !== req.body.confirmpass) {
      return res.send("passwords must match<br><a href='/register'>Back</a>")
    }

    const { firstName, lastName, email } = req.body

    const found = await Author.findOne({ email: email })
    if (found) {
      console.log('email address already registered')
      return res.redirect('/login')
    }

    const password = await bcrypt.hash(req.body.password, saltRounds)
    const author = new Author({ firstName, lastName, email, password })
    await author.save()
    res.send("Author created, please login<br><a href='/login'>Login</a>")
  }
)
router.get('/members', checkLogin, async (req, res) => {
  try {
    const authors = await Author.find()
    const posts = await Post.find()
    res.render('home/members', { authors, posts })
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/signout', (req, res) => {
  req.session.user_id = null
  res.redirect('/')
})

module.exports = router
