const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const Author = require('../models/Author')
// const bcrypt = require('bcrypt')
// const saltRounds = 12

router.get('/', async (req, res) => {
  const authors = await Author.find()
  res.render('authors/authors', { authors: authors })
})

// not sure whether or not to keep this, this prevents folks from trying to get /authors/new which isn't a valid request on this route.
router.get('/new', (req, res) => {
  res.redirect('/register')
})

router.get('/:id', async (req, res) => {
  const id = req.params.id
  try {
    const author = await Author.findById(id)
    if (!author) {
      console.log('author not found')
      return res.redirect('/authors')
    }
    res.render('authors/author', { author: author })
  } catch (err) {
    console.error(err)
    res.redirect('/authors')
  }
})

router.get('/:id/edit', async (req, res) => {
  const id = req.params.id
  try {
    const author = await Author.findById(id)
    res.render('authors/edit', { author: author })
  } catch (err) {
    console.error(err)
    res.redirect('/authors')
  }
})

router.patch(
  '/:id',
  [
    body('firstName').isLength({ min: 1 }).withMessage('First name must have at least 1 character'),
    body('lastName').isLength({ min: 1 }).withMessage('Last name must have at least 1 character'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
      }

      const id = req.params.id
      const { firstName, lastName, email } = req.body
      await Author.findByIdAndUpdate(id, { firstName, lastName, email })
      res.redirect(`/authors/${id}`)
    } catch (err) {
      console.error(err)
    }
  }
)

router.delete('/:id/delete', async (req, res) => {
  const id = req.params.id
  try {
    await Author.findByIdAndDelete(id)
    res.redirect('/authors')
  } catch (err) {
    console.error(err)
  }
})

module.exports = router
