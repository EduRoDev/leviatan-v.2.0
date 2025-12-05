import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDTO {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    last_name: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()  
    email: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @Transform(({ value }) => value.trim())
    password: string;
}