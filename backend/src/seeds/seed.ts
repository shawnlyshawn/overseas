// DB에 초기 데이터 생성하는 file
import 'dotenv/config'; // for local execution
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import connectDB from '../config/database';

import User from '../models/user.model';
import HostInstitution from '../models/host-institution.model';
import Application from '../models/application.model';
import ApplicationModificationLog from '../models/application-modification-log.model';

const ids = {
    users: {
        student: new mongoose.Types.ObjectId(),
        lecturer: new mongoose.Types.ObjectId(),
        staff: new mongoose.Types.ObjectId(),
    },
    hostInstitutions: {
        cuk: new mongoose.Types.ObjectId(),
        mit: new mongoose.Types.ObjectId(),
        tum: new mongoose.Types.ObjectId(),
    },
    applications: {
        cuk: new mongoose.Types.ObjectId(),
        mit: new mongoose.Types.ObjectId(),
        tum: new mongoose.Types.ObjectId(),
    },
};

const users = [
    {
        _id: ids.users.student,
        firstName: 'seohyun',
        lastName: 'park',
        email: 'seohyun@unive.it',
        password: 's123!',
        role: 'student',
        department:
            'department_of_environmental_sciences_informatics_and_statistics',
        matriculationNumber: '777',
    },
    {
        _id: ids.users.lecturer,
        firstName: 'heungmin',
        lastName: 'son',
        email: 'heungmin@unive.it',
        password: 'h123!',
        role: 'lecturer',
        department: 'department_of_economics',
    },
    {
        _id: ids.users.staff,
        firstName: 'kangin',
        lastName: 'lee',
        email: 'kangin@unive.it',
        password: 'k123!',
        role: 'office_staff',
        department: 'overseas_office',
    },
];

const hostInstitutions = [
    {
        _id: ids.hostInstitutions.cuk,
        name: 'The Catholic University of Korea',
        country: 'Republic of Korea',
        city: 'Bucheon',
        availableSlots: 7,
        applicationDeadline: new Date('2026-05-20'),
    },
    {
        _id: ids.hostInstitutions.mit,
        name: 'Massachusetts Institute of Technology',
        country: 'United States',
        city: 'Cambridge',
        availableSlots: 3,
        applicationDeadline: new Date('2026-05-17'),
    },
    {
        _id: ids.hostInstitutions.tum,
        name: 'Technical University of Munich',
        country: 'Germany',
        city: 'Munich',
        availableSlots: 5,
        applicationDeadline: new Date('2026-06-01'),
    },
];

const applications = [
    {
        _id: ids.applications.cuk,
        academicYear: '2026/2027',
        expectedMobilityPeriod: 'first_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.cuk,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName: 'Introduction to Artificial Intelligence',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0123',
                caFoscariCourseName: 'Artificial Intelligence',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: 'CS205',
                foreignCourseName: 'Database Systems',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0456',
                caFoscariCourseName: 'Database Management Systems',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-catholic-university.pdf',
                path: '/uploads/learning-agreements/la-catholic-university.pdf',
                uploadedAt: new Date('2026-04-15'),
            },
        },

        reviewStatus: 'pending',
        rejectionReason: null,
        reviewDate: null,
        phase: 'awaiting_application_approval',

        preDepartureCompletedAt: null,
        canceledAt: null,
        closedAt: null,

        lastModifiedBy: ids.users.student,
    },

    {
        _id: ids.applications.mit,
        academicYear: '2026/2027',
        expectedMobilityPeriod: 'full_year',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.mit,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName: 'Introduction to Machine Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Machine Learning',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.1020',
                foreignCourseName: 'Software Construction',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0412',
                caFoscariCourseName: 'Software Engineering',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-mit.pdf',
                path: '/uploads/learning-agreements/la-mit.pdf',
                uploadedAt: new Date('2026-04-20'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-08-25'),
        },

        reviewStatus: 'approved',
        rejectionReason: null,
        reviewDate: new Date('2026-05-02'),
        phase: 'in_mobility',

        preDepartureCompletedAt: new Date('2026-05-05'),
        canceledAt: null,
        closedAt: null,

        lastModifiedBy: ids.users.staff,
    },

    {
        _id: ids.applications.tum,
        academicYear: '2025/2026',
        expectedMobilityPeriod: 'second_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.tum,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'IN2396',
                foreignCourseName: 'Web Application Engineering',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0677',
                caFoscariCourseName: 'Web Applications and Technologies',
                caFoscariCourseCredits: 6,
                result: {
                    score: '28',
                    examDate: new Date('2026-06-20'),
                },
            },
            {
                foreignCourseCode: 'IN2107',
                foreignCourseName: 'Natural Language Processing',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName: 'Natural Language Processing',
                caFoscariCourseCredits: 6,
                result: {
                    score: '30L',
                    examDate: new Date('2026-06-25'),
                },
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-tum.pdf',
                path: '/uploads/learning-agreements/la-tum.pdf',
                uploadedAt: new Date('2026-01-18'),
            },
        },

        transcriptOfRecords: {
            file: {
                fileName: 'transcript-tum.pdf',
                path: '/uploads/transcripts/transcript-tum.pdf',
                uploadedAt: new Date('2026-07-01'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-02-10'),
            departureDate: new Date('2026-06-30'),
        },

        reviewStatus: 'pending',
        rejectionReason: null,
        reviewDate: null,
        phase: 'awaiting_score_approval',

        preDepartureCompletedAt: new Date('2026-01-25'),
        canceledAt: null,
        closedAt: null,

        lastModifiedBy: ids.users.student,
    },
];

const applicationModificationLogs = [
    {
        modifiedBy: ids.users.student,
        application: ids.applications.cuk,
        modificationReason: null,

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'first_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.cuk,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName: 'Introduction to Artificial Intelligence',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0123',
                caFoscariCourseName: 'Artificial Intelligence',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-catholic-draft.pdf',
                path: '/uploads/learning-agreements/la-catholic-draft.pdf',
                uploadedAt: new Date('2026-04-10'),
            },
        },

        reviewStatus: 'approved',
        rejectionReason: null,
        reviewDate: new Date('2026-04-12'),
        phase: 'created',

        preDepartureCompletedAt: null,
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.student,
        application: ids.applications.cuk,
        modificationReason: null,

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'first_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.cuk,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName: 'Introduction to Artificial Intelligence',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0123',
                caFoscariCourseName: 'Artificial Intelligence',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: 'CS205',
                foreignCourseName: 'Database Systems',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0456',
                caFoscariCourseName: 'Database Management Systems',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-catholic-university.pdf',
                path: '/uploads/learning-agreements/la-catholic-university.pdf',
                uploadedAt: new Date('2026-04-15'),
            },
        },

        reviewStatus: 'pending',
        rejectionReason: null,
        reviewDate: null,
        phase: 'awaiting_application_approval',

        preDepartureCompletedAt: null,
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.student,
        application: ids.applications.mit,
        modificationReason:
            'The host institution changed the available course schedule.',

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'full_year',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.mit,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName: 'Introduction to Machine Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Machine Learning',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.1020',
                foreignCourseName: 'Software Construction',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0412',
                caFoscariCourseName: 'Software Engineering',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.4110',
                foreignCourseName: 'Representation Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0720',
                caFoscariCourseName: 'Deep Learning',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-mit-modification-1.pdf',
                path: '/uploads/learning-agreements/la-mit-modification-1.pdf',
                uploadedAt: new Date('2026-09-05'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-08-25'),
        },

        reviewStatus: 'approved',
        rejectionReason: null,
        reviewDate: new Date('2026-09-08'),
        phase: 'in_mobility',

        preDepartureCompletedAt: new Date('2026-05-05'),
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.student,
        application: ids.applications.mit,
        modificationReason:
            'I would like to replace Software Construction with an advanced AI course.',

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'full_year',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.mit,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName: 'Introduction to Machine Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Machine Learning',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.8640',
                foreignCourseName: 'Advanced Natural Language Processing',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName: 'Natural Language Processing',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-mit-modification-2.pdf',
                path: '/uploads/learning-agreements/la-mit-modification-2.pdf',
                uploadedAt: new Date('2026-09-15'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-08-25'),
        },

        reviewStatus: 'rejected',
        rejectionReason:
            'The proposed course does not provide sufficient credit equivalence.',
        reviewDate: new Date('2026-09-18'),
        phase: 'in_mobility',

        preDepartureCompletedAt: new Date('2026-05-05'),
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.student,
        application: ids.applications.mit,
        modificationReason:
            'The original course was canceled by the host institution.',

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'full_year',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.mit,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName: 'Introduction to Machine Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Machine Learning',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.4110',
                foreignCourseName: 'Representation Learning',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0720',
                caFoscariCourseName: 'Deep Learning',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-mit-modification-3.pdf',
                path: '/uploads/learning-agreements/la-mit-modification-3.pdf',
                uploadedAt: new Date('2026-09-22'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-08-25'),
        },

        reviewStatus: 'pending',
        rejectionReason: null,
        reviewDate: null,
        phase: 'in_mobility',

        preDepartureCompletedAt: new Date('2026-05-05'),
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.student,
        application: ids.applications.tum,
        modificationReason:
            'The actual examination date and score have been added.',

        academicYear: '2025/2026',
        expectedMobilityPeriod: 'second_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.tum,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'IN2396',
                foreignCourseName: 'Web Application Engineering',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0677',
                caFoscariCourseName: 'Web Applications and Technologies',
                caFoscariCourseCredits: 6,
                result: {
                    score: '28',
                    examDate: new Date('2026-06-20'),
                },
            },
            {
                foreignCourseCode: 'IN2107',
                foreignCourseName: 'Natural Language Processing',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName: 'Natural Language Processing',
                caFoscariCourseCredits: 6,
                result: {
                    score: '30L',
                    examDate: new Date('2026-06-25'),
                },
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-tum.pdf',
                path: '/uploads/learning-agreements/la-tum.pdf',
                uploadedAt: new Date('2026-01-18'),
            },
        },

        transcriptOfRecords: {
            file: {
                fileName: 'transcript-tum.pdf',
                path: '/uploads/transcripts/transcript-tum.pdf',
                uploadedAt: new Date('2026-07-01'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-02-10'),
            departureDate: new Date('2026-06-30'),
        },

        reviewStatus: 'pending',
        rejectionReason: null,
        reviewDate: null,
        phase: 'awaiting_score_approval',

        preDepartureCompletedAt: new Date('2026-01-25'),
        canceledAt: null,
        closedAt: null,
    },

    {
        modifiedBy: ids.users.lecturer,
        application: ids.applications.tum,
        modificationReason: null,

        academicYear: '2025/2026',
        expectedMobilityPeriod: 'second_semester',
        student: ids.users.student,
        hostInstitution: ids.hostInstitutions.tum,
        referentLecturer: ids.users.lecturer,

        examMappings: [
            {
                foreignCourseCode: 'IN2396',
                foreignCourseName: 'Web Application Engineering',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0677',
                caFoscariCourseName: 'Web Applications and Technologies',
                caFoscariCourseCredits: 6,
                result: {
                    score: '28',
                    examDate: new Date('2026-06-20'),
                },
            },
            {
                foreignCourseCode: 'IN2107',
                foreignCourseName: 'Natural Language Processing',
                foreignCourseCredits: 6,
                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName: 'Natural Language Processing',
                caFoscariCourseCredits: 6,
                result: {
                    score: '30L',
                    examDate: new Date('2026-06-25'),
                },
            },
        ],

        learningAgreement: {
            file: {
                fileName: 'la-tum.pdf',
                path: '/uploads/learning-agreements/la-tum.pdf',
                uploadedAt: new Date('2026-01-18'),
            },
        },

        transcriptOfRecords: {
            file: {
                fileName: 'transcript-tum-reviewed.pdf',
                path: '/uploads/transcripts/transcript-tum-reviewed.pdf',
                uploadedAt: new Date('2026-07-03'),
            },
        },

        mobilityDates: {
            arrivalDate: new Date('2026-02-10'),
            departureDate: new Date('2026-06-30'),
        },

        reviewStatus: 'approved',
        rejectionReason: null,
        reviewDate: new Date('2026-07-05'),
        phase: 'awaiting_score_approval',

        preDepartureCompletedAt: new Date('2026-01-25'),
        canceledAt: null,
        closedAt: null,
    },
];

const seedDatabase = async (): Promise<void> => {
    try {
        // DB 연결
        await connectDB();

        // 기존 seed 데이터 제거
        await ApplicationModificationLog.deleteMany({});
        await Application.deleteMany({});
        await User.deleteMany({});
        await HostInstitution.deleteMany({});
        
        // User 정보 hashing
        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        // seed 데이터 생성
        await User.insertMany(hashedUsers);
        await HostInstitution.insertMany(hostInstitutions);
        await Application.insertMany(applications);
        await ApplicationModificationLog.insertMany(applicationModificationLogs);

        console.log('Seed data created successfully.');
    } catch(error: unknown) {
        console.error('Failed to create seed data:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

void seedDatabase();