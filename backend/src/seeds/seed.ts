/*
CUK
bm_awaiting_lecturer_review
applicationReview.pending

MIT
dm_in_progress
과거 approved modification 반영 완료
rejected modification 1개
pending modification 1개

TUM
am_awaiting_lecturer_review
ToR 업로드 완료
모든 시험 score + examDate 입력 완료
examReview.pending
*/

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

import connectDB from '../config/database';

import User from '../models/user.model';
import HostInstitution from '../models/host-institution.model';
import Application from '../models/application.model';
import ApplicationModification from '../models/application-modification.model';

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

    modifications: {
        mitApproved: new mongoose.Types.ObjectId(),
        mitRejected: new mongoose.Types.ObjectId(),
        mitPending: new mongoose.Types.ObjectId(),
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
    // Before Mobility
    // Lecturer가 최초 Application과 LA를 검토해야 하는 상태
    {
        _id: ids.applications.cuk,

        student: ids.users.student,
        referentLecturer: ids.users.lecturer,
        hostInstitution: ids.hostInstitutions.cuk,

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'first_semester',

        status: 'bm_awaiting_lecturer_review',

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName:
                    'Introduction to Artificial Intelligence',
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
                caFoscariCourseName:
                    'Database Management Systems',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            filename: 'la-catholic-university.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-catholic-university.pdf',
            uploadedAt: new Date('2026-04-15'),
        },

        applicationReview: {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },

        hostUniversityArrivalDate: null,
        hostUniversityDepartureDate: null,

        transcriptOfRecords: null,

        examReview: {
            status: 'not_submitted',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },

    // During Mobility
    // 과거 승인된 modification이 Application 원본에 반영된 상태
    {
        _id: ids.applications.mit,

        student: ids.users.student,
        referentLecturer: ids.users.lecturer,
        hostInstitution: ids.hostInstitutions.mit,

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'full_year',

        status: 'dm_in_progress',

        examMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName:
                    'Introduction to Machine Learning',
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
            filename: 'la-mit-modification-1.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-mit-modification-1.pdf',
            uploadedAt: new Date('2026-09-05'),
        },

        applicationReview: {
            status: 'approved',
            reviewedBy: ids.users.lecturer,
            reviewedAt: new Date('2026-05-02'),
            rejectionReason: null,
        },

        hostUniversityArrivalDate: new Date('2026-08-25'),
        hostUniversityDepartureDate: null,

        transcriptOfRecords: null,

        examReview: {
            status: 'not_submitted',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },

    // After Mobility
    // ToR, score, examDate 입력 완료 후 Lecturer 검토 대기
    {
        _id: ids.applications.tum,

        student: ids.users.student,
        referentLecturer: ids.users.lecturer,
        hostInstitution: ids.hostInstitutions.tum,

        academicYear: '2025/2026',
        expectedMobilityPeriod: 'second_semester',

        status: 'am_awaiting_lecturer_review',

        examMappings: [
            {
                foreignCourseCode: 'IN2396',
                foreignCourseName:
                    'Web Application Engineering',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0677',
                caFoscariCourseName:
                    'Web Applications and Technologies',
                caFoscariCourseCredits: 6,

                result: {
                    score: '28',
                    examDate: new Date('2026-06-20'),
                },
            },
            {
                foreignCourseCode: 'IN2107',
                foreignCourseName:
                    'Natural Language Processing',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName:
                    'Natural Language Processing',
                caFoscariCourseCredits: 6,

                result: {
                    score: '30L',
                    examDate: new Date('2026-06-25'),
                },
            },
        ],

        learningAgreement: {
            filename: 'la-tum.pdf',
            path: '/uploads/learning-agreements/la-tum.pdf',
            uploadedAt: new Date('2026-01-18'),
        },

        applicationReview: {
            status: 'approved',
            reviewedBy: ids.users.lecturer,
            reviewedAt: new Date('2026-01-22'),
            rejectionReason: null,
        },

        hostUniversityArrivalDate: new Date('2026-02-10'),
        hostUniversityDepartureDate: new Date('2026-06-30'),

        transcriptOfRecords: {
            filename: 'transcript-tum.pdf',
            path: '/uploads/transcripts/transcript-tum.pdf',
            uploadedAt: new Date('2026-07-01'),
        },

        examReview: {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },
];

const applicationModifications = [
    // 승인 완료
    // 이 내용은 현재 MIT Application에 반영되어 있음
    {
        _id: ids.modifications.mitApproved,

        application: ids.applications.mit,
        requestedBy: ids.users.student,

        description:
            'The host institution changed the available course schedule.',

        proposedExamMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName:
                    'Introduction to Machine Learning',
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

        proposedLearningAgreement: {
            filename: 'la-mit-modification-1.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-mit-modification-1.pdf',
            uploadedAt: new Date('2026-09-05'),
        },

        review: {
            status: 'approved',
            reviewedBy: ids.users.lecturer,
            reviewedAt: new Date('2026-09-08'),
            rejectionReason: null,
        },
    },

    // 거절 완료
    // Application 원본에는 반영되지 않음
    {
        _id: ids.modifications.mitRejected,

        application: ids.applications.mit,
        requestedBy: ids.users.student,

        description:
            'I would like to replace Software Construction ' +
            'with an advanced AI course.',

        proposedExamMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName:
                    'Introduction to Machine Learning',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Machine Learning',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: '6.8640',
                foreignCourseName:
                    'Advanced Natural Language Processing',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName:
                    'Natural Language Processing',
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

        proposedLearningAgreement: {
            filename: 'la-mit-modification-2.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-mit-modification-2.pdf',
            uploadedAt: new Date('2026-09-15'),
        },

        review: {
            status: 'rejected',
            reviewedBy: ids.users.lecturer,
            reviewedAt: new Date('2026-09-18'),
            rejectionReason:
                'The proposed course does not provide ' +
                'sufficient credit equivalence.',
        },
    },

    // 현재 Lecturer 검토 대기 중
    // 아직 Application 원본에는 반영되지 않음
    {
        _id: ids.modifications.mitPending,

        application: ids.applications.mit,
        requestedBy: ids.users.student,

        description:
            'The original course was canceled by the host institution.',

        proposedExamMappings: [
            {
                foreignCourseCode: '6.3900',
                foreignCourseName:
                    'Introduction to Machine Learning',
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
            {
                foreignCourseCode: '6.4290',
                foreignCourseName:
                    'Advances in Computer Vision',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0731',
                caFoscariCourseName: 'Computer Vision',
                caFoscariCourseCredits: 6,
            },
        ],

        proposedLearningAgreement: {
            filename: 'la-mit-modification-3.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-mit-modification-3.pdf',
            uploadedAt: new Date('2026-09-22'),
        },

        review: {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },
];

const seedDatabase = async (): Promise<void> => {
    try {
        await connectDB();

        // 자식 collection부터 삭제
        await ApplicationModification.deleteMany({});
        await Application.deleteMany({});
        await HostInstitution.deleteMany({});
        await User.deleteMany({});

        const hashedUsers = await Promise.all(
            users.map(async (user) => ({
                ...user,
                password: await bcrypt.hash(user.password, 10),
            }))
        );

        await User.insertMany(hashedUsers);
        await HostInstitution.insertMany(hostInstitutions);
        await Application.insertMany(applications);
        await ApplicationModification.insertMany(
            applicationModifications
        );

        console.log('Seed data created successfully.');
    } catch (error: unknown) {
        console.error('Failed to create seed data:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
};

void seedDatabase();