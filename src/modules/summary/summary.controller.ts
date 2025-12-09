import { Controller, Post, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Post('create')
    async create(@Query('document') document:number){
        return this.summaryService.create(document);
    }
}
