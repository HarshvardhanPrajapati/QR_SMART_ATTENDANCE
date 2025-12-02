const Attendance = require('../models/Attendance.js');
const Session = require('../models/Session.js');
const Student = require('../models/Student.js');
const Enrollment = require('../models/Enrollment.js');
const Course = require('../models/Course.js');
const { validateQRData } = require('../utils/qrGenerator.js');

// @desc    Mark attendance via QR scan
// @route   POST /api/student/mark-attendance
// @access  Private (Student)
exports.markAttendance = async (req, res) => {
    try {
        console.log("The qr Result is: ",req.body.qrCodeData || req.body.qrResult);

        const { qrCodeData, qrResult, location } = req.body; // Support both field names
        const qrData = qrCodeData || qrResult; // Use whichever is provided
        
        // 1. Decrypt and Validate QR
        const decryptedData = validateQRData(qrData);
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

        // 4. Check if student is enrolled in this course
        const enrollment = await Enrollment.findOne({
            student: student._id,
            course: courseId,
            status: 'Active'
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'You are not enrolled in this course. Please contact your administrator.' });
        }

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
            .populate('session', 'createdAt expiresAt')
            .sort({ createdAt: -1 });
            
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get enrolled courses with attendance stats
// @route   GET /api/student/courses
// @access  Private
exports.getEnrolledCourses = async (req, res) => {
    try {
        const student = await Student.findOne({ user: req.user.id });
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Get all active enrollments
        const enrollments = await Enrollment.find({ 
            student: student._id, 
            status: 'Active' 
        })
        .populate({
            path: 'course',
            populate: { path: 'teacher', select: 'name email' }
        });

        // Calculate attendance stats for each course
        const coursesWithStats = await Promise.all(
            enrollments.map(async (enrollment) => {
                const courseId = enrollment.course._id;
                
                // Get all sessions for this course
                const sessions = await Session.find({ course: courseId }).sort({ createdAt: -1 });
                
                // Get attendance records for this student in this course
                const attendanceRecords = await Attendance.find({
                    student: student._id,
                    course: courseId
                }).populate('session', 'createdAt expiresAt');

                // Calculate stats
                const totalSessions = sessions.length;
                const presentCount = attendanceRecords.filter(a => a.status === 'Present').length;
                const absentCount = attendanceRecords.filter(a => a.status === 'Absent').length;
                const attendancePercentage = totalSessions > 0 
                    ? Math.round((presentCount / totalSessions) * 100) 
                    : 0;

                return {
                    enrollment: enrollment._id,
                    course: {
                        _id: enrollment.course._id,
                        name: enrollment.course.name,
                        code: enrollment.course.code,
                        department: enrollment.course.department,
                        semester: enrollment.course.semester,
                        credits: enrollment.course.credits,
                        teacher: enrollment.course.teacher
                    },
                    totalSessions,
                    presentCount,
                    absentCount,
                    attendancePercentage,
                    enrollmentDate: enrollment.enrollmentDate
                };
            })
        );

        res.json(coursesWithStats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance records for a specific course
// @route   GET /api/student/courses/:courseId/attendance
// @access  Private
exports.getCourseAttendance = async (req, res) => {
    try {
        const { courseId } = req.params;
        
        if (!courseId) {
            return res.status(400).json({ message: 'Course ID is required' });
        }

        const student = await Student.findOne({ user: req.user.id });
        
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // Verify student is enrolled
        const enrollment = await Enrollment.findOne({
            student: student._id,
            course: courseId,
            status: 'Active'
        });

        if (!enrollment) {
            return res.status(403).json({ message: 'Not enrolled in this course' });
        }

        // Get all sessions for this course
        const sessions = await Session.find({ course: courseId })
            .sort({ createdAt: -1 });

        // Get all attendance records for this student in this course
        const attendanceRecords = await Attendance.find({
            student: student._id,
            course: courseId
        }).populate('session', 'createdAt expiresAt');

        // Create a map of sessionId -> attendance record
        // Filter out records where session is null (session was deleted)
        const attendanceMap = new Map();
        attendanceRecords.forEach(record => {
            if (record.session && record.session._id) {
                attendanceMap.set(record.session._id.toString(), record);
            }
        });

        // Check and mark absent for any expired sessions that don't have attendance records
        const now = new Date();
        for (const session of sessions) {
            if (new Date(session.expiresAt) < now && !attendanceMap.has(session._id.toString())) {
                // Session expired and student didn't mark attendance - mark absent
                await Attendance.findOneAndUpdate(
                    {
                        session: session._id,
                        student: student._id
                    },
                    {
                        session: session._id,
                        student: student._id,
                        course: courseId,
                        status: 'Absent',
                        markedAt: new Date(session.expiresAt)
                    },
                    {
                        upsert: true,
                        new: true
                    }
                );
            }
        }

        // Re-fetch attendance records after marking absent
        const updatedAttendanceRecords = await Attendance.find({
            student: student._id,
            course: courseId
        }).populate('session', 'createdAt expiresAt');

        const updatedAttendanceMap = new Map();
        updatedAttendanceRecords.forEach(record => {
            if (record.session && record.session._id) {
                updatedAttendanceMap.set(record.session._id.toString(), record);
            }
        });

        // Build complete attendance list (all sessions with present/absent status)
        const attendanceList = sessions.map(session => {
            if (!session || !session._id) {
                return null;
            }
            
            const attendance = updatedAttendanceMap.get(session._id.toString());
            return {
                _id: attendance?._id || null,
                sessionId: session._id,
                date: session.createdAt || new Date(),
                time: session.createdAt || new Date(),
                status: attendance?.status || 'Absent',
                markedAt: attendance?.markedAt || (session.expiresAt ? new Date(session.expiresAt) : new Date()),
                sessionExpiredAt: session.expiresAt
            };
        }).filter(item => item !== null); // Remove any null entries

        const courseData = await Course.findById(courseId).populate('teacher', 'name email');
        
        if (!courseData) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.json({
            course: courseData,
            attendance: attendanceList
        });
    } catch (error) {
        console.error('Error in getCourseAttendance:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ 
            message: error.message || 'Failed to fetch course attendance',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Helper function to mark absent for students who didn't scan when session expires
// This should be called periodically or when checking attendance
exports.markAbsentForExpiredSession = async (sessionId) => {
    try {
        const session = await Session.findById(sessionId).populate('course');
        if (!session) return;

        // Only process if session has expired and is still marked as active
        if (new Date() <= new Date(session.expiresAt) || !session.isActive) {
            return;
        }

        // Get all enrolled students for this course
        const enrollments = await Enrollment.find({
            course: session.course._id,
            status: 'Active'
        });

        // Get all students who already marked attendance
        const presentStudents = await Attendance.find({
            session: sessionId,
            status: 'Present'
        }).select('student');

        const presentStudentIds = new Set(
            presentStudents.map(a => a.student.toString())
        );

        // Mark absent for all enrolled students who didn't scan
        const absentPromises = enrollments
            .filter(enrollment => !presentStudentIds.has(enrollment.student.toString()))
            .map(enrollment =>
                Attendance.findOneAndUpdate(
                    {
                        session: sessionId,
                        student: enrollment.student
                    },
                    {
                        session: sessionId,
                        student: enrollment.student,
                        course: session.course._id,
                        status: 'Absent',
                        markedAt: new Date(session.expiresAt) // Mark at expiry time
                    },
                    {
                        upsert: true,
                        new: true
                    }
                )
            );

        await Promise.all(absentPromises);
        console.log(`Marked absent for expired session ${sessionId}`);
    } catch (error) {
        console.error('Error marking absent for expired session:', error);
    }
};