import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '@/modules/users/users.service';
import { comparePassword, hashPassword } from '@/helpers/util';
import { JwtService } from '@nestjs/jwt';
import { AuthDto, ChangePasswordDto, CheckCodeDto } from './dto/create-auth.dto';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService, private jwtService: JwtService, private mailerService: MailerService) {}
  
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user || !(await comparePassword(pass, user.password))) {
        throw new BadRequestException('Invalid email or password');
    }
    if (!user.isActive) {
        throw new UnauthorizedException('Your account is inactive.');
    }
    return user;
  }
  
  async login(user: any) {
    const payload = { username: user.email, sub: user._id };
    return {
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  register = async (registerDto: AuthDto) => {
     return await this.usersService.register(registerDto);
  }

  checkCode = async (checkCodeDto: CheckCodeDto) => {
    return await this.usersService.checkCode(checkCodeDto);
  }
  retryActive = async (email: string) => {
    return await this.usersService.retryActive(email);
  }

  retryPassword = async (email: string) => {
    return await this.usersService.retryPassword(email);
  }
  changePassword = async (changePasswordDto: ChangePasswordDto) => {
    return await this.usersService.changePassword(changePasswordDto);
  }
}