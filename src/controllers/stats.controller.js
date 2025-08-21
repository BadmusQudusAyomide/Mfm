import { User } from '../models/User.js'
import Course from '../models/Course.js'
import Subject from '../models/Subject.js'
import Quiz from '../models/Quiz.js'
import Tutorial from '../models/Tutorial.js'

export const getStats = async (req, res) => {
  try {
    const [users, courses, subjects, quizzes, pdfs] = await Promise.all([
      User.countDocuments({}),
      Course.countDocuments({}),
      Subject.countDocuments({}),
      Quiz.countDocuments({}),
      Tutorial.countDocuments({}),
    ])
    res.json({ users, courses, subjects, quizzes, pdfs })
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stats' })
  }
}
