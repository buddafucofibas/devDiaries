const menu = document.querySelector('ul')
const body = document.querySelector('body')
const burger = document.querySelector('.hamburger_wrapper')

burger.addEventListener('click', function () {
  menu.classList.toggle('show')
  body.classList.toggle('stop-scroll')
})
