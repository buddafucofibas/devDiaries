const express = require('express')
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcrypt')
const Author = require('../models/Author')
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
    console.log('you are logged in')
    return res.redirect('/members')
  }
  res.render('home/home')
})

router.get('/login', (req, res) => {
  res.render('home/login')
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
        console.log('Email not found, please registered')
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
  res.render('home/register')
})

router.get('/members', checkLogin, (req, res) => {
  res.render('home/members')
})

module.exports = router
