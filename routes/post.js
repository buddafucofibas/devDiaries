const express = require('express')
const Post = require('../models/Post')
const Author = require('../models/Author')
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
    return res.redirect('/posts')
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id
    const post = await Post.findById(id)
    const isOwner = req.session.user_id === post.author._id.toString()
    return res.render('posts/post', { post, isOwner })
  } catch (err) {
    res.status(500).json({ error: err })
  }
})

router.get('/:id/edit', checkIsOwner, async (req, res) => {
  const id = req.params.id
  const post = await Post.findById(id)
  res.render('posts/edit', { post })
})

router.patch('/:id', checkIsOwner, async (req, res) => {
  const id = req.params.id
  const { title, content } = req.body
  const post = await Post.findById(id)
  post.title = title
  post.content = content
  post.dateCreated = new Date()
  await post.save()

  res.redirect('/posts')
})

router.delete('/:id/delete', checkIsOwner, (req, res) => {
  const id = req.params.id
  res.send(`post ${id} will be deleted here`)
})
module.exports = router
