import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { hashPassword } from '@/helpers/util';
import aqp from 'api-query-params';
import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { AuthDto, ChangePasswordDto, CheckCodeDto } from '@/auth/dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Public } from '@/decorator/meta-data';
@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,
        private mailerService: MailerService
    ) {}
    async isEmailExist(email: string) {
        return await this.userModel.exists({ email });
    }
    async create(createUserDto: CreateUserDto) {
        const { name, email, password, phone, address } = createUserDto;
        //check email
        const isEmailExist = await this.isEmailExist(email);
        if (isEmailExist) {
            throw new BadRequestException('Email already exists');
        }
        const hashedPassword = await hashPassword(password);
        const user = await this.userModel.create({ name, email, phone, address, password: hashedPassword });
        return {
            _id: user._id,
        };
    }

    async findAll(query: string, currentPage: number, pageSize: number) {
        if (!currentPage) {
            currentPage = 1;
        }
        if (!pageSize) {
            pageSize = 1;
        }
        const { filter, sort } = aqp(query);
        if (filter.current) {
            delete filter.current;
        }
        if (filter.pageSize) {
            delete filter.pageSize;
        }
        const totalItems = (await this.userModel.find(filter)).length;
        const totalPages = Math.ceil(totalItems / pageSize);
        const skip = (currentPage - 1) * pageSize;
        
        const users = await this.userModel
            .find(filter)
            .skip(skip)
            .select('-password')
            .limit(pageSize)
            .sort(sort as any);
        return { 
            meta: {
                current: currentPage,
                pageSize: pageSize,
                pages: totalPages,
                total: totalItems
            },
            users
        };
    }

    async findOne(id: string) {
        return await this.userModel.findById(id).select('-password');
    }

    async findByEmail(email: string) {
        return await this.userModel.findOne({ email });
    }

    async update(updateUserDto: UpdateUserDto) {
        return await this.userModel.findByIdAndUpdate(updateUserDto._id, { ...updateUserDto });
    }

    async remove(_id: string) {
        //check id is valid
        if (!mongoose.Types.ObjectId.isValid(_id)) {
            throw new BadRequestException('Invalid id');
        }
        return await this.userModel.findByIdAndDelete(_id);
    }

    async register(registerDto: AuthDto) {
        const { name, email, password} = registerDto;
        //check email
        const isEmailExist = await this.isEmailExist(email);
        if (isEmailExist) {
            throw new BadRequestException('Email already exists');
        }
        const hashedPassword = await hashPassword(password);
        const codeId = uuidv4();
        const user = await this.userModel.create({
            name, 
            email, 
            password: hashedPassword, 
            codeId: codeId,
            isActive: false,
            codeExpired: dayjs().add(5, 'minutes').toDate()
        });
        await this.mailerService.sendMail({
            to: user.email, // list of receivers
            from: 'noreply@nestjs.com', // sender address
            subject: 'Activate your account', // Subject line
            template: 'register',
            context: {
                name: user?.name ?? user.email,
                activationCode: codeId,
            },
        })
        return {
            _id: user._id,
        };

    }
    
    async checkCode(data: CheckCodeDto) {
        const user = await this.userModel.findOne({ _id: data._id, codeId: data.code });
        if (!user) {
            throw new BadRequestException('Code is not valid');
        }
        const codeExpired = dayjs().isBefore(user.codeExpired);
        if (!codeExpired) {
            throw new BadRequestException('Code is expired');
        }
        await this.userModel.updateOne({ _id: user._id }, { isActive: true });
        return data;
    }

    async retryActive(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('Email not found');
        }
        if(user.isActive) {
            throw new BadRequestException('User already active');
        }
        const codeId = uuidv4();

        await this.userModel.updateOne({_id: user._id}, { codeId: codeId, codeExpired: dayjs().add(5, 'minutes').toDate() });
        this.mailerService.sendMail({
            to: user.email, // list of receivers
            from: 'noreply@nestjs.com', // sender address
            subject: 'Activate your account', // Subject line
            template: 'register',
            context: {
                name: user?.name ?? user.email,
                activationCode: codeId,
            },
        })
        return {_id: user._id};
    }

    async retryPassword(email: string) {
        const user = await this.userModel.findOne({ email });
        if (!user) {
            throw new BadRequestException('Email not found');
        }
        const codeId = uuidv4();

        await this.userModel.updateOne({_id: user._id}, { codeId: codeId, codeExpired: dayjs().add(5, 'minutes').toDate() });
        this.mailerService.sendMail({
            to: user.email, // list of receivers
            from: 'noreply@nestjs.com', // sender address
            subject: 'Change password account', // Subject line
            template: 'register',
            context: {
                name: user?.name ?? user.email,
                activationCode: codeId,
            },
        })
        return {_id: user._id, email: user.email};
    }

    async changePassword(data: ChangePasswordDto) {
        if(data.password !== data.confirmPassword) {
            throw new BadRequestException('Password and confirm password do not match');
        }
        const user = await this.userModel.findOne({ email: data.email});
        const isBeforeCodeExpired = dayjs().isBefore(user.codeExpired);
        if(!isBeforeCodeExpired) {
            throw new BadRequestException('Code is expired');
        }else {
            const newPassword = await hashPassword(data.password);
            await this.userModel.updateOne({_id: user._id}, { password: newPassword });
            return {_id: user._id};
        }
    }
}
