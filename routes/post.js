const express = require('express')
const Post = require('../models/Post')
const Author = require('../models/Author')
const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const posts = await Post.find().populate('author').exec()
    res.render('posts/posts', { posts: posts })
  } catch (err) {
    res.json({ error: err })
  }
})

router.get('/new', async (req, res) => {
  res.render('posts/new')
})

router.post('/new', async (req, res) => {
  try {
    const author = req.session.user_id
    const { title, content } = req.body
    const post = new Post({ title, content, author })
    await post.save()
    return res.redirect('/posts')
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/:id', async (req, res) => {})

router.get('/:id/edit', (req, res) => {
  const id = req.params.id
  res.render('posts/edit', { id: id })
})

router.patch('/:id', (req, res) => {
  const id = req.params.id
  res.set('refresh', `2;url=http://localhost:3000/posts/${id}`)
  res.redirect(201, `/${id}`)
})

router.delete('/:id/delete', (req, res) => {
  const id = req.params.id
  res.send(`post ${id} will be deleted here`)
})
module.exports = router
