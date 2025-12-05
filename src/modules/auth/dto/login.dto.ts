import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MinLength} from "class-validator";

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    @MinLength(8)
    password: string;
}