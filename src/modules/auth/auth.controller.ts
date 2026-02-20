import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { UserService } from '../user/user.service';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService,
        private readonly userService: UserService,
    ) { }

    @Post('register')
    singUp(@Body() registerDTO: RegisterDTO) {
        return this.authService.singUp(registerDTO);
    }

    @Post('login')
    singIn(@Body() loginDTO: LoginDTO) {
        return this.authService.singIn(loginDTO);
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    getProfile(@Query('email') email: string) {
        return this.userService.findByEmail(email);
    }

    @Patch('change-password')
    @UseGuards(AuthGuard)
    changePassword(@Query('email') email: string, @Body('newPassword') newPassword: string) {
        return this.authService.changePassword(email, newPassword);
    }
}
