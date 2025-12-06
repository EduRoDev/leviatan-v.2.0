import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubjectDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    description: string;

}