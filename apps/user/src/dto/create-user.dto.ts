import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail({}, {message: 'Некорректный email'})
    readonly email: string;
    @IsNotEmpty()
    @IsString({message: 'Должно быть строкой'})
    @Length(4, 255, {message: 'Пароль должен быть длиннее 4 и короче 255 символов'})
    readonly password: string;
}
