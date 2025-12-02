const express = require('express');
const router = express.Router();
const { 
    getSystemStats, 
    createCourse, 
    getAllUsers, 
    getAllCourses,
    getCourseDetails,
    getStudentByRollNumber,
    enrollStudent,
    deleteCourse,
    deleteStudent,
    deleteTeacher
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes here are protected and for Admins only
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getSystemStats);
router.get('/courses', getAllCourses);
router.get('/courses/:id', getCourseDetails);
router.post('/courses', createCourse);
router.delete('/courses/:id', deleteCourse);
router.post('/courses/:courseId/enroll', enrollStudent);
router.get('/students/:rollNumber', getStudentByRollNumber);
router.delete('/students/:id', deleteStudent);
router.delete('/teachers/:id', deleteTeacher);
router.get('/users', getAllUsers);

module.exports = router;