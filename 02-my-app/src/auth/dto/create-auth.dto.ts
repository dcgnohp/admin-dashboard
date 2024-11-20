import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class AuthDto {
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is not valid' })
    email: string;
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
    @IsOptional()
    name: string;
}

export class CheckCodeDto {
    @IsNotEmpty({ message: 'Code is required' })
    code: string;
    @IsNotEmpty({ message: 'Id is required' })
    _id: string;
}

export class ChangePasswordDto {
    @IsNotEmpty({ message: 'Code is required' })
    code: string;
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
    @IsNotEmpty({ message: 'Confirm password is required' })
    confirmPassword: string;
    @IsNotEmpty({ message: 'Email is required' })
    @IsEmail({}, { message: 'Email is not valid' })
    email: string;
}
