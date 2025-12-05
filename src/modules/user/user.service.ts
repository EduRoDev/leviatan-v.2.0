import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entities';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/createUser.dto';
import { UpdateUserDTO } from './dto/updateUser.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>
    ){}
    
    create(createUserDTO: CreateUserDTO) {
        const newUser = this.userRepo.create(createUserDTO);
        if (!newUser) {
            throw new BadRequestException('Error creating user');
        }
        return this.userRepo.save(newUser);
    }

    async findByEmail(email: string) {
        const user = await this.userRepo.findOneBy({ email})
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user;
    }
    
    async updateUser(updateUserDTO: UpdateUserDTO, id: number) {
        const user = await this.userRepo.findOneBy({ id });
        if (!user) {
            throw new BadRequestException('User not found');
        }
        const updatedUser = Object.assign(user, updateUserDTO);
        return this.userRepo.save(updatedUser);
    }
}
