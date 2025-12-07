import { IsNotEmpty, IsString } from "class-validator";

export class CreateDocumentDTO {

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsString()
    @IsNotEmpty()
    file_path: string;

    @IsString()
    @IsNotEmpty()
    audio_url?: string;

}