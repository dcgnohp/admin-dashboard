import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(
    OmitType(CreateUserDto, ['password', 'address'] as const)
) {
    @IsMongoId()
    @IsNotEmpty()
    _id: string;
}
