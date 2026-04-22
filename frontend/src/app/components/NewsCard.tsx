import { MessageCircle, Eye, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsCardProps {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  publisher: {
    name: string;
    logo: string;
  };
  category: string;
  views: number;
  comments: number;
  publishedAt: string;
  onClick: () => void;
}

export function NewsCard({
  title,
  excerpt,
  image,
  publisher,
  category,
  views,
  comments,
  publishedAt,
  onClick,
}: NewsCardProps) {
  return (
    <article
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-xl border border-gray-100/80 bg-white shadow-sm ring-1 ring-black/5 transition-[box-shadow,transform,border-color] hover:-translate-y-0.5 hover:border-gray-200/80 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      onClick={onClick}
    >
      {/* Фиксированное соотношение сторон: любое фото обрезается ровно, без сдвига вёрстки */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-gray-100">
        <ImageWithFallback
          src={image}
          alt={title}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.02]"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-16 bg-gradient-to-b from-black/35 to-transparent"
          aria-hidden
        />
        <div className="absolute left-3 top-3 z-20 max-w-[min(100%-1.5rem,16rem)]">
          <span className="inline-block max-w-full truncate rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm ring-1 ring-white/25 sm:text-sm">
            {category}
          </span>
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col p-4 sm:p-5">
        <div className="mb-3 flex min-w-0 shrink-0 items-center gap-2.5">
          <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-gray-100 ring-1 ring-gray-200/80">
            <ImageWithFallback
              src={publisher.logo}
              alt={publisher.name}
              className="h-full w-full object-cover"
            />
          </div>
          <span className="min-w-0 truncate text-sm font-medium text-gray-800">{publisher.name}</span>
        </div>

        {/* Фиксированная высота под 2 строки заголовка — карточки в ряду выравниваются */}
        <h3 className="mb-2 line-clamp-2 min-h-[2.875rem] text-base font-semibold leading-snug text-gray-900 transition-colors sm:min-h-[3.25rem] sm:text-lg group-hover:text-blue-600">
          {title}
        </h3>

        {/* Ровно 3 строки лида — сетка не «прыгает» */}
        <p className="line-clamp-3 min-h-[4.125rem] text-sm leading-relaxed text-gray-600 sm:min-h-[4.5rem]">
          {excerpt}
        </p>

        <div className="mt-auto flex min-w-0 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500 sm:text-sm">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex min-w-0 max-w-full items-center gap-1.5">
              <Clock className="size-3.5 shrink-0 text-gray-400 sm:size-4" aria-hidden />
              <span className="truncate tabular-nums">{publishedAt}</span>
            </span>
            <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums text-gray-600">
              <Eye className="size-3.5 shrink-0 text-gray-400 sm:size-4" aria-hidden />
              <span>{views.toLocaleString('ru-RU')}</span>
            </span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 tabular-nums text-gray-600">
            <MessageCircle className="size-3.5 shrink-0 text-gray-400 sm:size-4" aria-hidden />
            <span>{comments.toLocaleString('ru-RU')}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
