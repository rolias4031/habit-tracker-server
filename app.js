const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const habitsRoutes = require('./routes/habitsRoutes')
const authRoutes = require('./routes/authRoutes')
require('dotenv').config()

const app = express()
app.use(bodyParser.json())
app.use(session({ secret: 'my secret', resave: false, saveUninitialized: false }))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

app.use('/habits', habitsRoutes)
app.use('/auth', authRoutes)

app.use((error, req, res, next) => {
  console.log(error)
  const statusCode = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(statusCode).json({ message: message, data: data })
})

mongoose.connect(
  `mongodb+srv://sailor:${process.env.PASSWORD}@sm-cluster.yldyivh.mongodb.net/${process.env.DATABASE_NAME}?retryWrites=true&w=majority`
).then((result) => {
  console.log('Connected to MongoDB')
  app.listen(process.env.PORT)
}).catch((err) => {
  console.log(err)
})
