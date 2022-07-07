const express = require('express')
const bcrypt = require('bcryptjs')
const { validationResult } = require('express-validator')
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')
require('dotenv').config()

const secret = 'SecretString'

exports.getUsers = (req, res, next) => {
  User.find()
    .then(users => {
      console.log(users)
      res.status(200).json({
        message: 'Users fetched',
        users: users
      })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.login = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  let loadedUser
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        const error = new Error('Couldn\'t find that user')
        error.statusCode = 401
        console.log(error)
        throw error
      }
      loadedUser = user
      return bcrypt.compare(password, user.password)
    })
    .then(isEqual => {
      if (!isEqual) {
        const error = new Error('Password incorrect')
        error.statusCode = 401
        throw error
      }
      const token = jwt.sign({
        email: loadedUser.email,
        userId: loadedUser._id.toString()
      }, process.env.TOKEN_SECRET,
      { expiresIn: '1h' })
      res.status(200).json({ token: token, userId: loadedUser._id.toString() })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}

exports.signup = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed')
    error.statusCode = 422
    error.data = errors.array()
    throw error
  }
  const email = req.body.email
  const name = req.body.name
  const password = req.body.password
  bcrypt.hash(password, 12)
    .then(hashedPw => {
      const user = new User({
        email: email,
        password: hashedPw,
        name: name
      })
      return user.save()
    })
    .then(newUser => {
      res.status(201).json({ message: 'User created!', user: newUser })
    })
    .catch(err => {
      if (!err.statusCode) {
        err.statusCode = 500
      }
      next(err)
    })
}
