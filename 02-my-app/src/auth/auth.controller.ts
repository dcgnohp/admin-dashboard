import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, ChangePasswordDto, CheckCodeDto } from './dto/create-auth.dto';
import { LocalAuthGuard } from './passport/local-auth.guard';
import { JwtAuthGuard } from './passport/jwt-auth.guard';
import { Public } from '../decorator/meta-data';
import { MailerService } from '@nestjs-modules/mailer';
import { ResponseMessage } from '@/decorator/customize';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly mailerService: MailerService) {}

  @Post("login")
  @Public()
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Login")
  
  handleLogin(@Request() req: any) {
    return this.authService.login(req.user);
  }

  
  @Get("profile")
  getProfile(@Request() req: any) {
    return req.user;
  }

  @Post("register")
  @Public()
  register(@Body() registerDto: AuthDto) {
    return this.authService.register(registerDto);
  }

  @Post("retry-active")
  @Public()
  retryActive(@Body("email") email: string) {
    return this.authService.retryActive(email);
  }
  @Post("retry-password")
  @Public()
  retryPassword(@Body("email") email: string) {
    return this.authService.retryPassword(email);
  }

  @Post("check-code")
  @Public()
  checkCode(@Body() checkCodeDto: CheckCodeDto) {
    return this.authService.checkCode(checkCodeDto);
  }

  @Get("send-mail")
  @Public()
  sendMail() {
    this.mailerService
      .sendMail({
        to: 'phogndc@gmail.com', // list of receivers
        from: 'noreply@nestjs.com', // sender address
        subject: 'Testing Nest MailerModule ✔', // Subject line
        text: 'welcome', // plaintext body
        template: 'register',
        context: {
          name: 'Gngohp',
          activationCode: '123456',

        },
      })
    return "ok"
  }
  @Post("change-password")
  @Public()
  changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.authService.changePassword(changePasswordDto);
  }
}
