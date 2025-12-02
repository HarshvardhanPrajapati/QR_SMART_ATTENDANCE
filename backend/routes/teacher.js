const express = require('express');
const router = express.Router();
const { createSession, cancelSession, getTeacherCourses, getCourseSessions, getSessionDetails, getSessionAttendance } = require('../controllers/teacherController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/roleCheck');

// All routes here are protected and for Teachers only
router.use(protect);
router.use(authorize('teacher'));

router.post('/sessions', createSession);
router.put('/sessions/:id/cancel', cancelSession);
router.get('/courses', getTeacherCourses);
router.get('/courses/:id/sessions', getCourseSessions);
router.get('/sessions/:id/details', getSessionDetails);
router.get('/sessions/:id/attendance', getSessionAttendance);

module.exports = router;