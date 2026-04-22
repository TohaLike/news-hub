import { IsOptional, IsUUID } from 'class-validator';

/** Для гостей: стабильный uuid из `localStorage`, чтобы не накручивать просмотры с одного браузера. */
export class RecordPublicationViewDto {
  @IsOptional()
  @IsUUID('4', { message: 'viewerKey должен быть UUID версии 4' })
  viewerKey?: string;
}
