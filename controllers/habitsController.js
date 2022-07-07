const Habit = require('../models/habitModel')
const User = require('../models/userModel')
const { validationResult } = require('express-validator')

exports.createHabit = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed')
    error.statusCode = 422
    throw error
  }
  const title = req.body.title
  const description = req.body.description
  let creator
  const habit = new Habit({
    title: title,
    description: description,
    completions: 0,
    creator: req.userId
  })
  habit.save()
    .then((result) => {
      return User.findById(req.userId)
    })
    .then((user) => {
      creator = user
      user.posts.push(habit)
      return user.save()
    })
    .then((result) => {
      res.status(201).json({
        message: 'Habit created!',
        post: habit,
        creator: { _id: creator._id, name: creator.name }
      })
    })
    .catch((err) => {
      errorHandler(err, next)
    })
}

exports.getHabit = (req, res, next) => {
  const habitId = req.params.habitId
  Habit.findById(habitId).then((habit) => {
    missingHabitHandler(habit)
    res.status(200).json({
      message: 'Habit fetched!',
      habit: habit
    })
  }).catch((err) => {
    errorHandler(err, next)
  })
}

exports.getHabits = (req, res, next) => {
  Habit.find().then((habits) => {
    console.log(habits)
    res.status(200).json({
      message: 'All habits fetched!',
      habits: habits
    })
  }).catch((err) => {
    errorHandler(err, next)
  })
}

exports.updateHabit = (req, res, next) => {
  const habitId = req.params.habitId
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const error = new Error('Validation Failed')
    error.statusCode = 422
    throw error
  }
  const title = req.body.title
  const description = req.body.description
  const completions = req.body.completions

  Habit.findById(habitId).then((habit) => {
    if (!habit) {
      const error = new Error('Could not find habit')
      error.statusCode = 404
      throw error
    }
    habit.title = title
    habit.description = description
    habit.completions = completions
    habit.creator = { name: 'Sailor' }
    return habit.save()
  }).then((result) => {
    res.status(200).json({
      message: 'Habit updated!',
      habit: result
    })
  }).catch((err) => {
    errorHandler(err, next)
  })
}

exports.deleteHabit = (req, res, next) => {
  const habitId = req.params.habitId
  Habit.findById(habitId).then((habit) => {
    missingHabitHandler(habit)
    return Habit.findByIdAndRemove(habitId)
  }).then((result) => {
    res.status(200).json({
      message: 'Habit deleted!'
    })
  }).catch((err) => {
    errorHandler(err, next)
  })
}

function errorHandler (error, next) {
  if (!error.statusCode) {
    error.statusCode = 500
  }
  next(error)
}

function missingHabitHandler (habit) {
  if (!habit) {
    const error = new Error('Could not find that habit')
    error.statusCode = 404
    throw error
  }
}
