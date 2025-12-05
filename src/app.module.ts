import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './database/database.module';
import { DatabaseService } from './database/database.service';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';



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
    UserModule
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
