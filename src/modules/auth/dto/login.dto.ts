import { Transform } from "class-transformer";
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength} from "class-validator";

export class LoginDTO {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @Transform(({ value }) => value.trim())
    @MinLength(8)
    @MaxLength(10)
    password: string;
}