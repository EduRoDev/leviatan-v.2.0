import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entities';
import { Repository } from 'typeorm';
import { CreateUserDTO } from './dto/createUser.dto';

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

    findByEmail(email: string) {
        const user = this.userRepo.findOneBy({ email})
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return user;
    }
}
