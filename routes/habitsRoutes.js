const express = require('express')
const { body } = require('express-validator')
const isAuth = require('../middleware/isAuth')
const habitsController = require('../controllers/habitsController')

const validationConfig = {
  min: 1
}

const router = express.Router()

router.get('/all-habits', isAuth, habitsController.getHabits)

router.get('/single-habit/:habitId', isAuth, habitsController.getHabit)

router.post(
  '/create-habit',
  isAuth,
  [
    body('title').trim().isLength({ min: validationConfig.min }),
    body('description').trim().isLength({ min: validationConfig.min })
  ],
  habitsController.createHabit
)

router.put(
  '/edit-habit/:habitId', isAuth,
  [
    body('title').trim().isLength({ min: validationConfig.min }),
    body('description').trim().isLength({ min: validationConfig.min })
  ],
  habitsController.updateHabit
)

router.delete('/delete-habit/:habitId', isAuth, habitsController.deleteHabit)

module.exports = router
