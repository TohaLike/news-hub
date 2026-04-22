import { IsEmail, IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @MinLength(1, { message: 'Введите имя' })
  @MaxLength(80)
  name: string;

  @IsIn(['reader', 'publisher'], { message: 'Выберите тип аккаунта' })
  accountType: 'reader' | 'publisher';

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;
}
