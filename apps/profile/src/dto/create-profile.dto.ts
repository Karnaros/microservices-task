import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateProfileDto {
    @IsNotEmpty()
    @IsNumber()
    readonly id: number;
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly firstname: string;
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly middlename: string;
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly lastname: string;
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly phoneNumber: string;
    @IsOptional()
    @IsString({message: 'Должно быть строкой'})
    readonly about: string;
}
