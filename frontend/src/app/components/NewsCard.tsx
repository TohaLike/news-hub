import { MessageCircle, Eye, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NewsCardProps {
  id: number;
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
  onClick 
}: NewsCardProps) {
  return (
    <article 
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback 
          src={image} 
          alt={title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
          {category}
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <ImageWithFallback 
            src={publisher.logo} 
            alt={publisher.name}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-sm text-gray-600">{publisher.name}</span>
        </div>
        
        <h3 className="text-lg mb-2 line-clamp-2 hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>
        
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
