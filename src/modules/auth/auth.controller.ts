import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { RegisterDTO } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {

    constructor(
        private readonly authService: AuthService
    ){}

    @Post('register')
    singUp(@Body() registerDTO: RegisterDTO){
        return this.authService.singUp(registerDTO);
    }

    @Post('login')
    singIn(@Body() loginDTO: LoginDTO){
        return this.authService.singIn(loginDTO);
    }

    @Get('profile')
    @UseGuards(AuthGuard)
    getProfile(){
        return { message: 'This is a protected profile route' };
    }
}
