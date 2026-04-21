import { NewsCard } from '../components/NewsCard';
import { PublisherFilter } from '../components/PublisherFilter';
import type { News, Publisher } from '../types';

export interface HomePageProps {
  publishers: Publisher[];
  selectedPublisher: number | null;
  onSelectPublisher: (id: number | null) => void;
  filteredNews: News[];
  onOpenNews: (id: number) => void;
}

export function HomePage({
  publishers,
  selectedPublisher,
  onSelectPublisher,
  filteredNews,
  onOpenNews,
}: HomePageProps) {
  return (
    <>
      <PublisherFilter
        publishers={publishers}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={onSelectPublisher}
      />

      {filteredNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item) => (
            <NewsCard
              key={item.id}
              {...item}
              onClick={() => onOpenNews(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">Новостей не найдено</p>
        </div>
      )}
    </>
  );
}
