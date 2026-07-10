import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import User from '../models/user.model';

export class AuthenticationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

interface LoginResult {
    token: string;
    user: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
        role: string;
    };
}

export const loginUser = async (email: string, password: string): Promise<LoginResult> => {
    // find user
    const trimmedEmail = email.trim();
    const user = await User.findOne({ email: trimmedEmail });

    // error
    if (!user){
        throw new AuthenticationError('Invalid email or password.');
    }

    // compare pw and hashedPw
    const trimmedPassword = password.trim();
    const passwordMatch = await bcrypt.compare(trimmedPassword, user.password);
    
    // error
    if (!passwordMatch) {
        throw new AuthenticationError('Invalid email or password.');
    }

    // create JWT
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not configured.');
    }

    const token = jwt.sign(
        {
            userId: user._id.toString(),
            role: user.role,
        }, // payload
        jwtSecret, // secret
        {
            expiresIn: '1d',
        } // options
    );
    
    return {
        token,
        user: {
            id: user._id.toString(),
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
        }
    };
}