import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreatePublicationCommentDto {
  @IsString()
  @MinLength(1, { message: 'Текст комментария не может быть пустым' })
  @MaxLength(2000, { message: 'Комментарий слишком длинный' })
  text!: string;

  /** Id комментария, на который отвечаем (та же публикация) */
  @IsOptional()
  @IsString()
  parentCommentId?: string;
}
