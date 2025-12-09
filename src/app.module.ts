import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SubjectModule } from './modules/subject/subject.module';
import { DocumentModule } from './modules/document/document.module';
import { OpenAiModule } from './utils/open-ai/open-ai.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
    }),
    AuthModule,
    UserModule,
    SubjectModule,
    DocumentModule,
    OpenAiModule,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
