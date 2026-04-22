import {
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { NEWS_RUBRICS } from '../constants/rubrics';

export class CreateGroupPublicationDto {
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(500)
  excerpt: string;

  @IsString()
  @MinLength(40)
  @MaxLength(20000)
  content: string;

  @IsString()
  @IsIn([...NEWS_RUBRICS], { message: 'Выберите рубрику из списка' })
  category: string;

  @IsOptional()
  @ValidateIf((_, v) => typeof v === 'string' && v.trim() !== '')
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  image?: string;
}
