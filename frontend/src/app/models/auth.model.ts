import { UserRole } from './user.model';

export interface AuthUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface LoginResponseData {
    token: string;
    user: AuthUser;
}