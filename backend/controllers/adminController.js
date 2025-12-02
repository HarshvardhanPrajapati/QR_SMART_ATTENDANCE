const User = require('../models/User');
const Course = require('../models/Course');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Enrollment = require('../models/Enrollment');
const Session = require('../models/Session');

// @desc    Get system statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getSystemStats = async (req, res) => {
    try {
        const totalStudents = await Student.countDocuments();
        const totalTeachers = await Teacher.countDocuments();
        const totalCourses = await Course.countDocuments();
        const totalAttendance = await Attendance.countDocuments();

        res.json({
            students: totalStudents,
            teachers: totalTeachers,
            courses: totalCourses,
            totalAttendanceLogs: totalAttendance
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new course
// @route   POST /api/admin/courses
// @access  Private (Admin)
exports.createCourse = async (req, res) => {
    try {
        const { name, code, department, credits, teacherId, semester } = req.body;

        // Verify teacher exists
        const teacher = await Teacher.findOne({ user: teacherId });
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const course = await Course.create({
            name,
            code,
            department,
            credits,
            teacher: teacherId, // Link to User ID of the teacher
            semester
        });

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all courses
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get course details with enrolled students
// @route   GET /api/admin/courses/:id
// @access  Private (Admin)
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name email');
        
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get all enrollments for this course
        const enrollments = await Enrollment.find({ course: course._id, status: 'Active' })
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            })
            .sort({ enrollmentDate: -1 });

        res.json({
            course,
            enrollments
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student by roll number
// @route   GET /api/admin/students/:rollNumber
// @access  Private (Admin)
exports.getStudentByRollNumber = async (req, res) => {
    try {
        const student = await Student.findOne({ rollNumber: req.params.rollNumber })
            .populate('user', 'name email');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json(student);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Enroll student in course
// @route   POST /api/admin/courses/:courseId/enroll
// @access  Private (Admin)
exports.enrollStudent = async (req, res) => {
    try {
        const { studentId } = req.body;
        const courseId = req.params.courseId;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Verify student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({
            student: studentId,
            course: courseId,
            semester: course.semester
        });

        if (existingEnrollment) {
            if (existingEnrollment.status === 'Active') {
                return res.status(400).json({ message: 'Student is already enrolled in this course' });
            } else {
                // Reactivate if previously dropped
                existingEnrollment.status = 'Active';
                await existingEnrollment.save();
                return res.json(existingEnrollment);
            }
        }

        // Get current academic year (simplified - you might want to make this configurable)
        const currentYear = new Date().getFullYear();
        const academicYear = `${currentYear}-${currentYear + 1}`;

        // Create enrollment
        const enrollment = await Enrollment.create({
            student: studentId,
            course: courseId,
            semester: course.semester,
            academicYear,
            status: 'Active'
        });

        // Update student's enrolledCourses array
        if (!student.enrolledCourses.includes(courseId)) {
            student.enrolledCourses.push(courseId);
            await student.save();
        }

        const populatedEnrollment = await Enrollment.findById(enrollment._id)
            .populate({
                path: 'student',
                populate: { path: 'user', select: 'name email' }
            });

        res.status(201).json(populatedEnrollment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a course
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
exports.deleteCourse = async (req, res) => {
    try {
        const courseId = req.params.id;
        
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Delete all related data
        await Enrollment.deleteMany({ course: courseId });
        await Session.deleteMany({ course: courseId });
        await Attendance.deleteMany({ course: courseId });
        
        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a student
// @route   DELETE /api/admin/students/:id
// @access  Private (Admin)
exports.deleteStudent = async (req, res) => {
    try {
        const studentId = req.params.id;
        
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Delete all related data
        await Enrollment.deleteMany({ student: studentId });
        await Attendance.deleteMany({ student: studentId });
        
        // Delete the user account
        if (student.user) {
            await User.findByIdAndDelete(student.user);
        }
        
        // Delete the student profile
        await Student.findByIdAndDelete(studentId);

        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a teacher
// @route   DELETE /api/admin/teachers/:id
// @access  Private (Admin)
exports.deleteTeacher = async (req, res) => {
    try {
        const userId = req.params.id; // This could be User ID or Teacher ID
        
        // Try to find teacher by User ID first (since Course stores teacher as User ID)
        let teacher = await Teacher.findOne({ user: userId });
        
        // If not found, try by Teacher ID
        if (!teacher) {
            teacher = await Teacher.findById(userId);
        }
        
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Find all courses taught by this teacher
        const courses = await Course.find({ teacher: teacher.user });
        const courseIds = courses.map(c => c._id);

        // Delete all related data
        await Enrollment.deleteMany({ course: { $in: courseIds } });
        await Session.deleteMany({ course: { $in: courseIds } });
        await Attendance.deleteMany({ course: { $in: courseIds } });
        await Course.deleteMany({ teacher: teacher.user });
        
        // Delete the user account
        if (teacher.user) {
            await User.findByIdAndDelete(teacher.user);
        }
        
        // Delete the teacher profile
        await Teacher.findByIdAndDelete(teacherId);

        res.json({ message: 'Teacher deleted successfully' });
    } catch (error) {
        console.error('Error deleting teacher:', error);
        res.status(500).json({ message: error.message });
    }
};