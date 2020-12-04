const express = require('express')
const { route } = require('.')
const router = express.Router()

router.get('/', (req, res) => {
  res.render('posts/posts')
})

router.get('/new', (req, res) => {
  res.render('posts/new')
})

router.post('/new', (req, res) => {
  console.log('post created')
  res.redirect('/posts')
})

router.get('/:id', (req, res) => {
  const id = req.params.id
  res.render('posts/post', { id: id })
})

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
