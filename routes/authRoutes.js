const express = require('express')
const { body } = require('express-validator')
const authController = require('../controllers/authController')
const User = require('../models/userModel')

const router = express.Router()

router.get('/all-users', authController.getUsers)

router.post('/login', authController.login)

router.put('/signup', [
  body('email').isEmail()
    .withMessage('Enter a valid email.')
    .custom((value, { req }) => {
      return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
          return Promise.reject('E-mail address already exists')
        }
      })
    })
    .normalizeEmail(),
  body('name').trim().isAlpha().withMessage('Invalid Name'),
  body('password').trim().isLength({ min: 5 })
], authController.signup)

module.exports = router
