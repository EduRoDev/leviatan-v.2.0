import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class UpdateUserDTO {
    @IsString()
    @IsNotEmpty()
    name?: string;

    @IsString()
    @IsNotEmpty()
    last_name?: string;
    
    @IsEmail()
    email?: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(10)
    password?: string;
}