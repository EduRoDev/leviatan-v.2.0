import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfigService } from './database-config/database-config.service';
import { DatabaseService } from './database/database.service';
import { DatabaseModule } from './database/database.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule
  ],
  controllers: [],
  providers: [DatabaseConfigService, DatabaseService],
})
export class AppModule {}
