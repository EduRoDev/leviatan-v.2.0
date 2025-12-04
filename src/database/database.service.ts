import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Document } from 'src/entities/document.entities';
import { Flashcard } from 'src/entities/flashcard.entities';
import { Subject } from 'src/entities/subject.entities';
import { Summary } from 'src/entities/summary.entities';
import { User } from 'src/entities/user.entities';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
    constructor(
        private configService: ConfigService,
    ){}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: this.configService.get<'postgres'>('DB_TYPE'),
            host: this.configService.get<string>('DB_HOST'),
            port: this.configService.get<number>('DB_PORT'),
            username: this.configService.get<string>('DB_USERNAME'),
            password: this.configService.get<string>('DB_PASSWORD'),
            database: this.configService.get<string>('DB_NAME'),
            synchronize: true,
            autoLoadEntities: true,
            entities: [User,Subject,Document,Summary,Flashcard]
        }
    }
}