import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { AuthGuard } from '../auth/guard/auth.guard';

@Controller('summary')
export class SummaryController {
    constructor(private readonly summaryService: SummaryService) {}

    @Post('create')
    @UseGuards(AuthGuard)
    async create(@Query('document') document:number){
        return this.summaryService.create(document);
    }
}
