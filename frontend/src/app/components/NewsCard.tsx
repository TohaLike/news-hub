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
      className="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={title}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute left-3 top-3 rounded-full bg-blue-600 px-3 py-1 text-sm text-white">
          {category}
        </div>
      </div>

      <div className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <ImageWithFallback
            src={publisher.logo}
            alt={publisher.name}
            className="h-6 w-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">{publisher.name}</span>
        </div>

        <h3 className="mb-2 line-clamp-2 text-lg transition-colors hover:text-blue-600">{title}</h3>

        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{excerpt}</p>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock size={16} />
              {publishedAt}
            </span>
            <span className="flex items-center gap-1">
              <Eye size={16} />
              {views}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <MessageCircle size={16} />
            {comments}
          </span>
        </div>
      </div>
    </article>
  );
}
