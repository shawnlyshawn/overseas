export type UserRole = 'student' | 'lecturer' | 'office_staff';

export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    department: string;
    matriculationNumber: string | null;
}

export type UserSummary = User;