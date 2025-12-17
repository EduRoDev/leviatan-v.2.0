import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
    @IsNumber()
    question_id: number;

    @IsString()
    selected_option: string;
}

export class SubmitQuizDto {
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => AnswerDto)
    answers: AnswerDto[];

    @IsOptional()
    @IsNumber()
    time_taken?: number;
}