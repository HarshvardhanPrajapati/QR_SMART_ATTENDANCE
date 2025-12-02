const Session = require('../models/Session.js');
const Course = require('../models/Course.js');
const { generateQRData } = require('../utils/qrGenerator.js');
const Attendance = require('../models/Attendance');
// @desc    Generate a new class session with QR code
// @route   POST /api/teacher/sessions
// @access  Private (Teacher only)
exports.createSession = async (req, res) => {
    try {
        const { courseId, timeInMinutes } = req.body;

        // Verify course belongs to teacher
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }
        
        // Check if teacher owns this course (assuming req.user is set by auth middleware)
        if (course.teacher.toString() !== req.user.id) {
             return res.status(403).json({ message: 'Not authorized for this course' });
        }

        // Calculate expiration
        const expiresIn = (timeInMinutes || 10) * 60 * 1000; // Default 10 mins
        const expiresAt = new Date(Date.now() + expiresIn);

        // Create Session Object first to get an ID
        const session = new Session({
            course: courseId,
            creator: req.user.id,
            expiresAt,
            qrCodeData: "temp" // Placeholder
        });

        // Generate Encrypted QR Data
        const qrData = generateQRData(session._id, courseId, expiresIn);
        
        // Update session with the actual QR string (we stringify the object)
        session.qrCodeData = JSON.stringify(qrData);
        await session.save();

        res.status(201).json({
            sessionId: session._id,
            qrCode: qrData, // Frontend will convert this object to a QR image
            expiresAt
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Manually cancel/end a session
// @route   PUT /api/teacher/sessions/:id/cancel
// @access  Private (Teacher)
exports.cancelSession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await Session.findById(sessionId).populate('course');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to cancel this session' });
        }

        session.isActive = false;
        session.expiresAt = new Date();
        await session.save();

        return res.json({ message: 'Session cancelled successfully', session });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses for logged-in teacher
// @route   GET /api/teacher/courses
// @access  Private (Teacher)
exports.getTeacherCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all sessions for a specific course owned by the teacher
// @route   GET /api/teacher/courses/:id/sessions
// @access  Private (Teacher)
exports.getCourseSessions = async (req, res) => {
    try {
        const courseId = req.params.id;

        // Ensure course exists and belongs to this teacher
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this course' });
        }

        // Fetch all sessions for this course, newest first
        const sessions = await Session.find({ course: courseId }).sort({ createdAt: -1 });
        return res.json(sessions);
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get details for a specific session (including QR data)
// @route   GET /api/teacher/sessions/:id/details
// @access  Private (Teacher)
exports.getSessionDetails = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const session = await Session.findById(sessionId).populate('course');

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        if (session.course.teacher.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized for this session' });
        }

        let qrCode = null;
        try {
            qrCode = JSON.parse(session.qrCodeData);
        } catch (e) {
            qrCode = session.qrCodeData;
        }

        return res.json({
            _id: session._id,
            courseId: session.course._id,
            courseName: session.course.name,
            createdAt: session.createdAt,
            expiresAt: session.expiresAt,
            isActive: session.isActive,
            qrCode,
        });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance for a specific session
// @route   GET /api/teacher/sessions/:id/attendance
// @access  Private (Teacher)
exports.getSessionAttendance = async (req, res) => {
    // This requires the Attendance model, requiring circular dependency check in your mind
    // Ideally, import it at the top.
    
    try {
        const attendance = await Attendance.find({ session: (req.params.id) })
            .populate('student', 'rollNumber user') // Get student details
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            });
        console.log(attendance);
        res.json(attendance);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};