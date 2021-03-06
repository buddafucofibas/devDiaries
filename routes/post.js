const express = require('express')
const Post = require('../models/Post')
const Author = require('../models/Author')
const { findByIdAndDelete } = require('../models/Post')
const router = express.Router()

const checkIsOwner = async (req, res, next) => {
  const postID = req.params.id
  const post = await Post.findById(postID)
  const authorID = post.author._id.toString()
  const userID = req.session.user_id

  if (userID !== authorID) {
    return res.status(401).json({ msg: 'User not authorized to perform action' })
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

router.get('/new', async (req, res) => {
  res.render('posts/new')
})

router.post('/new', async (req, res) => {
  try {
    const author = req.session.user_id
    const { title, content } = req.body
    const post = new Post({ title, content, author })
    await post.save()
    // return res.redirect('/posts')
    return res.redirect(`/authors/${author}`)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const post = await Post.findById(id).populate('author').exec()
    const owner = req.session.user_id === post.author._id.toString()
    return res.render('posts/post', { post, owner, req })
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/:id/edit', checkIsOwner, async (req, res) => {
  const id = req.params.id
  const post = await Post.findById(id)
  res.render('posts/edit', { post, req })
})

router.patch('/:id', checkIsOwner, async (req, res) => {
  try {
    const id = req.params.id
    const { title, content } = req.body
    const post = await Post.findById(id)
    post.title = title
    post.content = content
    post.dateCreated = new Date()
    await post.save()
    return res.redirect(`/authors/${req.session.user_id}`)
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.delete('/:id/delete', checkIsOwner, async (req, res) => {
  try {
    const id = req.params.id
    await Post.findByIdAndDelete(id)
    return res.redirect('/posts')
  } catch (err) {
    res.status(500).json({ error: err })
  }
})
module.exports = router
