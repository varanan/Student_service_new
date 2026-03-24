const mongoose = require('mongoose');
const axios = require('axios');
const Student = require('../models/studentModel');

function buildIdFilter(param) {
  if (mongoose.Types.ObjectId.isValid(param)) {
    return { $or: [{ _id: param }, { studentId: param }] };
  }
  return { studentId: param };
}

exports.createStudent = async (req, res) => {
  try {
    const student = await Student.create(req.body);
    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `Duplicate value for ${field}` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getAllStudents = async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    const student = await Student.findOne(filter);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    const student = await Student.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'field';
      return res.status(409).json({ message: `Duplicate value for ${field}` });
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const filter = buildIdFilter(req.params.id);
    const student = await Student.findOneAndDelete(filter);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.status(200).json({ message: 'Student deleted', student });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getStudentWithExams = async (req, res) => {
  try {
    const { studentId } = req.params;
    const student = await Student.findOne({ studentId });

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const baseUrl = process.env.EXAM_SERVICE_URL;
    if (!baseUrl) {
      return res.status(200).json({
        student,
        exams: null,
        message: 'Exam service is currently unavailable',
      });
    }

    const url = `${baseUrl.replace(/\/$/, '')}/student/${encodeURIComponent(studentId)}`;

    try {
      const response = await axios.get(url, {
        timeout: 5000,
        validateStatus: () => true,
      });

      if (response.status >= 200 && response.status < 300) {
        return res.status(200).json({
          student,
          exams: response.data,
        });
      }

      return res.status(200).json({
        student,
        exams: null,
        message: 'Exam service is currently unavailable',
      });
    } catch (err) {
      return res.status(200).json({
        student,
        exams: null,
        message: 'Exam service is currently unavailable',
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};