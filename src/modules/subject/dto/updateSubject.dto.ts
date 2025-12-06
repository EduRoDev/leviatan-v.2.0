import { IsNotEmpty, IsString } from "class-validator";

export class UpdateSubjectDTO {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    description?: string;
}