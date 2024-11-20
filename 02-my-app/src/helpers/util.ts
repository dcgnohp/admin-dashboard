import * as bcrypt from 'bcrypt';
const saltOrRounds = 10;

export const hashPassword = async (plainPassword: string) => {
    try {
        return await bcrypt.hash(plainPassword, saltOrRounds);
    } catch (error) {
        throw new Error(error);
    }
}

export const comparePassword = async (plainPassword: string, hashedPassword: string) => {
    try {
        return await bcrypt.compare(plainPassword, hashedPassword);
    } catch (error) {
        throw new Error(error);
    }
}