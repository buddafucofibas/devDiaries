const express = require('express')
const Post = require('../models/Post')
const Author = require('../models/Author')
const router = express.Router()

const checkIsOwner = (req, res, next) => {
  if (req.params.id !== req.session.user_id) {
    return res.status(401).send('Action not authorized')
  }
  next()
}

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').exec()
    res.render('posts/posts', { posts: posts })
  } catch (err) {
    res.json({ error: err })
  }
})

router.get('/:id/new', checkIsOwner, async (req, res) => {
  const id = req.params.id
  const author = await Author.findById(id)
  res.render('posts/new', { author: author })
})

router.post('/:id/new', checkIsOwner, async (req, res) => {
  try {
    const id = req.params.id
    const author = await Author.findById(id)
    const { title, content } = req.body
    const post = new Post({ title, content, author: author._id })
    await post.save()
    res.redirect(`/authors/${id}`)
  } catch (err) {
    res.send(err)
  }
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  res.render('posts/post', { id: id })
})

router.get('/:id/edit', checkIsOwner, (req, res) => {
  const id = req.params.id
  res.render('posts/edit', { id: id })
})

router.patch('/:id', checkIsOwner, (req, res) => {
  const id = req.params.id
  res.set('refresh', `2;url=http://localhost:3000/posts/${id}`)
  res.redirect(201, `/${id}`)
})

router.delete('/:id/delete', checkIsOwner, (req, res) => {
  const id = req.params.id
  res.send(`post ${id} will be deleted here`)
})
module.exports = router
