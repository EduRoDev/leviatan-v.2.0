import { Module } from '@nestjs/common';
import { DocumentService } from './document.service';
import { DocumentController } from './document.controller';
import { SubjectModule } from '../subject/subject.module';
import { HttpModule } from '@nestjs/axios';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Document } from 'src/entities/document.entities';

@Module({
  imports: [
    SubjectModule,
    HttpModule,
    TypeOrmModule.forFeature([Document])
  ],
  providers: [DocumentService],
  controllers: [DocumentController]
})
export class DocumentModule {}
