/*
CUK
inbeom & minjae
bm_awaiting_lecturer_review
applicationReview.pending

MIT
seohyun & heungmin
dm_in_progress
과거 approved modification 반영 완료
rejected modification 1개
pending modification 1개

TUM
seohyun & minjae
am_awaiting_lecturer_review
ToR 업로드 완료
모든 시험 score + examDate 입력 완료
examReview.pending

OXFORD
inbeom & heungmin
dm_in_progress
원본 examMappings + Learning Agreement 유지
pending modification 1개
ApplicationModification.review.pending
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
        student1: new mongoose.Types.ObjectId(),
        student2: new mongoose.Types.ObjectId(),
        lecturer1: new mongoose.Types.ObjectId(),
        lecturer2: new mongoose.Types.ObjectId(),
        staff1: new mongoose.Types.ObjectId(),
    },

    hostInstitutions: {
        cuk: new mongoose.Types.ObjectId(),
        mit: new mongoose.Types.ObjectId(),
        tum: new mongoose.Types.ObjectId(),
        oxford: new mongoose.Types.ObjectId(),
    },

    applications: {
        cuk: new mongoose.Types.ObjectId(),
        mit: new mongoose.Types.ObjectId(),
        tum: new mongoose.Types.ObjectId(),
        oxford: new mongoose.Types.ObjectId(),
    },

    modifications: {
        mitApproved: new mongoose.Types.ObjectId(),
        mitRejected: new mongoose.Types.ObjectId(),
        mitPending: new mongoose.Types.ObjectId(),
        oxfordPending: new mongoose.Types.ObjectId(),
    },
};

const users = [
    {
        _id: ids.users.student1,
        firstName: 'seohyun',
        lastName: 'park',
        email: 'student1@unive.it',
        password: 's',
        role: 'student',
        department:
            'department_of_environmental_sciences_informatics_and_statistics',
        matriculationNumber: '1000001',
    },
    {
        _id: ids.users.student2,
        firstName: 'inbeom',
        lastName: 'hwang',
        email: 'student2@unive.it',
        password: 's',
        role: 'student',
        department:
            'venice_school_of_management',
        matriculationNumber: '1000002',
    },
    {
        _id: ids.users.lecturer1,
        firstName: 'heungmin',
        lastName: 'son',
        email: 'lecturer1@unive.it',
        password: 'l',
        role: 'lecturer',
        department: 'department_of_economics',
    },
    {
        _id: ids.users.lecturer2,
        firstName: 'minjae',
        lastName: 'kim',
        email: 'lecturer2@unive.it',
        password: 'l',
        role: 'lecturer',
        department: 'department_of_linguistics_and_comparative_cultural_studies',
    },
    {
        _id: ids.users.staff1,
        firstName: 'kangin',
        lastName: 'lee',
        email: 'staff1@unive.it',
        password: 's',
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
    {
        _id: ids.hostInstitutions.oxford,
        name: 'University of Oxford',
        country: 'United Kingdom',
        city: 'Oxford',
        availableSlots: 2,
        applicationDeadline: new Date('2026-06-10'),
    },
];

const applications = [
    // Before Mobility
    // Lecturer가 최초 Application과 LA를 검토해야 하는 상태
    {
        _id: ids.applications.cuk,

        student: ids.users.student2, // inbeom
        referentLecturer: ids.users.lecturer2, // minjae
        hostInstitution: ids.hostInstitutions.cuk, // cuk

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'first_semester',

        status: 'bm_awaiting_lecturer_review',

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName:
                    'Macroeconomics',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0123',
                caFoscariCourseName: 'Macroeconomics',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: 'CS205',
                foreignCourseName: 'Marketing and management',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0456',
                caFoscariCourseName:
                    'Marketing',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            filename: 'la-catholic-university.pdf',
            path:
                '/uploads/learning-agreements/' +
                'la-catholic-university.pdf',
            uploadedAt: new Date('2026-06-15'),
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
    // 과거 승인(2026-02-16)된 modification이 Application 원본에 반영된 상태
    {
        _id: ids.applications.mit,

        student: ids.users.student1, // seohyun
        referentLecturer: ids.users.lecturer1, // heungmin
        hostInstitution: ids.hostInstitutions.mit, // mit

        academicYear: '2025/2026',
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
            uploadedAt: new Date('2026-02-15'),
        },

        applicationReview: {
            status: 'approved',
            reviewedBy: ids.users.lecturer1,
            reviewedAt: new Date('2026-02-16'),
            rejectionReason: null,
        },

        hostUniversityArrivalDate: new Date('2025-09-10'),
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

        student: ids.users.student1, // seohyun
        referentLecturer: ids.users.lecturer2, // minjae
        hostInstitution: ids.hostInstitutions.tum, // tum

        academicYear: '2024/2025',
        expectedMobilityPeriod: 'second_semester',

        status: 'am_awaiting_lecturer_review',

        examMappings: [
            {
                foreignCourseCode: 'IN2396',
                foreignCourseName:
                    'Natural Language Processing',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0677',
                caFoscariCourseName:
                    'Natural Language Processing',
                caFoscariCourseCredits: 6,

                result: {
                    score: '30L',
                    examDate: new Date('2025-06-02'),
                },
            },
            {
                foreignCourseCode: 'IN2107',
                foreignCourseName:
                    'Engineering Mathematics',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0550',
                caFoscariCourseName:
                    'Engineering Mathematics',
                caFoscariCourseCredits: 6,

                result: {
                    score: '30L',
                    examDate: new Date('2025-06-07'),
                },
            },
        ],

        learningAgreement: {
            filename: 'la-tum.pdf',
            path: '/uploads/learning-agreements/la-tum.pdf',
            uploadedAt: new Date('2024-07-15'),
        },

        applicationReview: {
            status: 'approved',
            reviewedBy: ids.users.lecturer2, // minjae
            reviewedAt: new Date('2024-07-17'),
            rejectionReason: null,
        },

        hostUniversityArrivalDate: new Date('2024-08-17'),
        hostUniversityDepartureDate: new Date('2025-06-20'),

        transcriptOfRecords: {
            filename: 'transcript-tum.pdf',
            path: '/uploads/transcripts/transcript-tum.pdf',
            uploadedAt: new Date('2025-09-17'),
        },

        examReview: {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },

    // dm_in_progress에서 mod하고 lecturer "승인 기다리는" 상태
    // -> applications에는 원본데이터 유지!
    // lecturer 두 번째 tab에서 inbeom, seohyun mod 요청 함께 조회되어야!
    {
        _id: ids.applications.oxford,

        student: ids.users.student2, // inbeom
        referentLecturer: ids.users.lecturer1, // heungmin
        hostInstitution: ids.hostInstitutions.oxford,

        academicYear: '2026/2027',
        expectedMobilityPeriod: 'second_semester',

        status: 'dm_in_progress',

        examMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName: 'Labor Economics',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Labor Economics',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: 'CS202',
                foreignCourseName: 'Economic History',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0412',
                caFoscariCourseName: 'Economic History',
                caFoscariCourseCredits: 6,
            },
        ],

        learningAgreement: {
            filename: 'la-oxford.pdf',
            path: '/uploads/learning-agreements/la-oxford.pdf',
            uploadedAt: new Date('2026-01-20'),
        },

        applicationReview: {
            status: 'approved',
            reviewedBy: ids.users.lecturer1,
            reviewedAt: new Date('2026-01-22'),
            rejectionReason: null,
        },

        hostUniversityArrivalDate: new Date('2026-02-20'),
        hostUniversityDepartureDate: null,

        transcriptOfRecords: null,

        examReview: {
            status: 'not_submitted',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },
];

const applicationModifications = [
    // 승인 완료 (2026-02-15에 올려서 16일 승인)
    // 이 내용은 현재 MIT Application에 반영되어 있음
    {
        _id: ids.modifications.mitApproved,

        application: ids.applications.mit, // mit
        requestedBy: ids.users.student1, // seohyun

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
            uploadedAt: new Date('2026-02-15'),
        },

        review: {
            status: 'approved',
            reviewedBy: ids.users.lecturer1,
            reviewedAt: new Date('2026-02-16'),
            rejectionReason: null,
        },
    },

    // 거절 완료 (2026-02-15보다 전이어도 되고 후여도 되고 .. 근데 과목을 보니 후라고 하자)
    // Application 원본에는 반영되지 않음
    {
        _id: ids.modifications.mitRejected, // seohyun

        application: ids.applications.mit,
        requestedBy: ids.users.student1, // seohyun

        description:
            'I would like to replace Software Construction with an advanced AI course.',

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
                caFoscariCourseCredits: 3,
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
            uploadedAt: new Date('2026-03-04'),
        },

        review: {
            status: 'rejected',
            reviewedBy: ids.users.lecturer1,
            reviewedAt: new Date('2026-03-05'),
            rejectionReason:
                'The proposed course does not provide sufficient credit equivalence.',
        },
    },

    // 현재 Lecturer 검토 대기 중
    // 아직 Application 원본에는 반영되지 않음
    {
        _id: ids.modifications.mitPending, 

        application: ids.applications.mit, 
        requestedBy: ids.users.student1, // seohyun

        description:
            'I would like to change the course for personal reasons.',

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
            uploadedAt: new Date('2026-03-08'),
        },

        review: {
            status: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            rejectionReason: null,
        },
    },

    // 현재 Lecturer 검토 대기 중
    // 아직 Application 원본에는 반영되지 않음
    {
        _id: ids.modifications.oxfordPending,

        application: ids.applications.oxford,
        requestedBy: ids.users.student2, // inbeom

        description: 'One of the planned courses is no longer available this semester.',

        proposedExamMappings: [
            {
                foreignCourseCode: 'CS101',
                foreignCourseName: 'Labor Economics',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0678',
                caFoscariCourseName: 'Labor Economics',
                caFoscariCourseCredits: 6,
            },
            {
                foreignCourseCode: 'CS305',
                foreignCourseName: 'Game Theory',
                foreignCourseCredits: 6,

                caFoscariCourseCode: 'CT0412',
                caFoscariCourseName: 'Game Theory',
                caFoscariCourseCredits: 6,
            },
        ],

        proposedLearningAgreement: {
            filename: 'la-oxford-modification-1.pdf',
            path: '/uploads/learning-agreements/la-oxford-modification-1.pdf',
            uploadedAt: new Date('2026-03-10'),
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