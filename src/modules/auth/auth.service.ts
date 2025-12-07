import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { RegisterDTO } from './dto/register.dto';
import * as bcryptjs from 'bcryptjs';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';


@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService
    ) { }

    async singUp({ name, last_name, email, password }: RegisterDTO) {
        const user = await this.userService.findByEmail(email);
        if (user) {
            throw new BadRequestException('User already exists');
        }

        const newUser = await this.userService.create({
            name,
            last_name,
            email,
            password: await bcryptjs.hash(password, 10)
        });

        return newUser;
    }


    async singIn({ email, password }: LoginDTO) {
        const user = await this.userService.findByEmail(email)
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { email: user.email };
        const token = this.jwtService.sign(payload);

        return {
            token,
            email: user.email
        };
    }

    async changePassword(email: string, newPassword: string) {
        const user = await this.userService.findByEmail(email);
        if (!user) {
            throw new BadRequestException('User not found');
        }

        if (!/[A-Z]/.test(newPassword)) {
            throw new BadRequestException('Password must contain at least one uppercase letter');
        }

        if (!/[a-z]/.test(newPassword)) {
            throw new BadRequestException('Password must contain at least one lowercase letter');
        }

        if (!/[0-9]/.test(newPassword)) {
            throw new BadRequestException('Password must contain at least one number');
        }

        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
            throw new BadRequestException('Password must contain at least one special character');
        }

        const hashedPassword = await bcryptjs.hash(newPassword, 8);
        const updatedUser = await this.userService.updateUser({ password: hashedPassword }, user.id);

        return {
            message: 'Password updated successfully',
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                last_name: updatedUser.last_name
            }
        };
    }
}
