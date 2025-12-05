import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";


export class CreateUserDTO {
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
    password: string;
}