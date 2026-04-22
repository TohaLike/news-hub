import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateEditorialGroupDto {
  @IsString()
  @MinLength(2, { message: 'Название — минимум 2 символа' })
  @MaxLength(80)
  name: string;
}
