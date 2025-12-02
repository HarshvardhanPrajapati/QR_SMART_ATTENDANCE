const Attendance = require('../models/Attendance.js');
const Session = require('../models/Session.js');
const Student = require('../models/Student.js');
const { validateQRData } = require('../utils/qrGenerator.js');

// @desc    Mark attendance via QR scan
// @route   POST /api/student/mark-attendance
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
    try {
        console.log("The qr Result is: ",req.body.qrResult);

        const { qrResult, location } = req.body; // qrResult is the data scanned
        
        // 1. Decrypt and Validate QR
        const decryptedData = validateQRData(qrResult);
        if (!decryptedData) {
            console.log("Decrypted data me dikkat hai QR ke\n");
            return res.status(400).json({ message: 'Invalid QR Code' });
        }

        const { sessionId, courseId } = decryptedData;

        // 2. Validate Session Expiry (Database check)
        const session = await Session.findById(sessionId);
        if (!session || !session.isActive) {
            return res.status(400).json({ message: 'Session is inactive or invalid' });
        }
        
        if (new Date() > new Date(session.expiresAt)) {
            return res.status(400).json({ message: 'Session has expired' });
        }

        // 3. Get Student Profile
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // 4. Check if student is enrolled (Optional strict check)
        // const isEnrolled = student.enrolledCourses.includes(courseId);
        // if (!isEnrolled) return res.status(403).json({ message: 'Not enrolled in this course' });

        // 5. Check for Duplicate Attendance
        const existingAttendance = await Attendance.findOne({
            session: sessionId,
            student: student._id
        });

        if (existingAttendance) {
            return res.status(400).json({ message: 'Attendance already marked' });
        }

        // 6. Mark Attendance
        const newAttendance = await Attendance.create({
            session: sessionId,
            student: student._id,
            course: courseId,
            status: 'Present',
            location // Optional geo-coords
        });
        
        // Populate minimal fields for realtime updates
        const populatedAttendance = await Attendance.findById(newAttendance._id)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            });

        // Emit socket event for live session views (if io is available)
        const io = req.app.get('io');
        if (io) {
            io.to(String(sessionId)).emit('attendance:marked', {
                sessionId: String(sessionId),
                attendance: populatedAttendance,
            });
        }

        res.status(201).json({ message: 'Attendance marked successfully', data: newAttendance });

    } catch (error) {
        console.log("QR scanning error.\n");
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student attendance history
// @route   GET /api/student/attendance
// @access  Private
exports.getAttendanceHistory = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        const history = await Attendance.find({ student: student._id })
            .populate('course', 'name code')
            .populate('session', 'createdAt')
            .sort({ createdAt: -1 });
            
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};