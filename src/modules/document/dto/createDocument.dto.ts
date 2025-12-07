import { IsNotEmpty, IsString } from "class-validator";

export class CreateDocumentDTO {
    @IsString()
    @IsNotEmpty()
    title: string;
}