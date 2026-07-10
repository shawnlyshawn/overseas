import User from '../models/user.model';

export const findUserById = async (userId: string) => {
    return User.findById(userId).select('-password');;
}