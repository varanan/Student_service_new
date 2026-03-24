const express = require('express');
const router = express.Router();
const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStudentWithExams,

} = require('../controllers/studentController');

router.post('/', createStudent);
router.get('/', getAllStudents);
router.get('/:studentId/exams', getStudentWithExams);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;