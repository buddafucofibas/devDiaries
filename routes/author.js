const express = require('express')
const router = express.Router()
const path = require('path')
const fs = require('fs')
const multer = require('multer')
// i think this is where the images are temporarily uploaded
const upload = multer({ dest: 'public/images/userProfiles/' })
const { body, validationResult } = require('express-validator')
const Author = require('../models/Author')
const Post = require('../models/Post')
// const bcrypt = require('bcrypt')
// const saltRounds = 12

// this middleware checks to see if the author's ID matches the client's ID to prevent client's with non-matching ID's from accessing data altering routes like patch, delete, etc
const checkIsOwner = (req, res, next) => {
  if (req.session.user_id !== req.params.id) {
    return res.status(401).send('Action not authorized')
  }
  next()
}

router.get('/', async (req, res) => {
  try {
    const authors = await Author.find()
    res.render('authors/authors', { authors: authors, req })
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

// not sure whether or not to keep this, this prevents folks from trying to get /authors/new which isn't a valid request on this route.
router.get('/new', (req, res) => {
  res.redirect('/register')
})

router.get('/:id', async (req, res) => {
  // check if client id matches author id and passes along this match so the page is rendered differently
  const id = req.params.id
  const owner = req.session.user_id === id

  try {
    const author = await Author.findById(id)
    const posts = await Post.find({ author: id })
    if (!author) {
      console.log('author not found')
      return res.redirect('/authors')
    }
    res.render('authors/author', { author: author, owner: owner, posts: posts, req })
  } catch (err) {
    console.error(err)
    res.redirect('/authors')
  }
})

router.get('/:id/edit', checkIsOwner, async (req, res) => {
  const id = req.params.id
  try {
    const author = await Author.findById(id)
    res.render('authors/edit', { author: author, req })
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
  checkIsOwner,
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

router.post('/:id/image', upload.single('image'), (req, res) => {
  // temporary file location
  const tempPath = req.file.path
  // where i want to save files
  const targetPath = path.join(__dirname, `../public/images/userProfiles/${req.params.id}.png`)
  // checks extension
  if (path.extname(req.file.originalname).toLowerCase() == '.png') {
    // renames the temp path to the final name
    fs.rename(tempPath, targetPath, err => {
      if (err) return res.end(err)
      res.status(200).contentType('text/plain').end('File uploaded!')
    })
  }
})

router.delete('/:id/delete', checkIsOwner, async (req, res) => {
  const id = req.params.id
  try {
    // deletes author from database and removes user_id from session
    const pic = path.join(__dirname, `../public/images/userProfiles/${req.params.id}.png`)
    if (pic) {
      fs.unlink(pic, err => {
        if (err) {
          console.log('no pic to remove')
        }
      })
    }
    await Author.findByIdAndDelete(id)
    await Post.deleteMany({ author: id })
    req.session.user_id = null
    res.redirect('/login')
  } catch (err) {
    console.error(err)
  }
})

module.exports = router
