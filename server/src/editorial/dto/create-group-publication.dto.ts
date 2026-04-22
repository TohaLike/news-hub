import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';

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
  @MinLength(2)
  @MaxLength(60)
  category: string;

  @IsOptional()
  @ValidateIf((_, v) => typeof v === 'string' && v.trim() !== '')
  @IsUrl({ require_protocol: true })
  @MaxLength(2000)
  image?: string;
}
