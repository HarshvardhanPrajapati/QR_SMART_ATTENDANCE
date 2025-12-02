const express = require('express');
const router = express.Router();
const { markAttendance, getAttendanceHistory } = require('../controllers/studentController.js');
const { protect } = require('../middleware/auth.js');
const { authorize } = require('../middleware/roleCheck.js');

// All routes here are protected and for Students only
router.use(protect);
router.use(authorize('student'));

router.post('/mark-attendance', markAttendance);
router.get('/attendance', getAttendanceHistory);

module.exports = router;