import { NewsCard } from '../components/NewsCard';
import { PublisherFilter } from '../components/PublisherFilter';
import type { News, Publisher } from '../types';

export interface HomePageProps {
  publishers: Publisher[];
  selectedPublisher: string | null;
  onSelectPublisher: (id: string | null) => void;
  filteredNews: News[];
  onOpenNews: (id: string) => void;
  feedLoading?: boolean;
  feedError?: string | null;
}

export function HomePage({
  publishers,
  selectedPublisher,
  onSelectPublisher,
  filteredNews,
  onOpenNews,
  feedLoading = false,
  feedError = null,
}: HomePageProps) {
  return (
    <>
      <PublisherFilter
        publishers={publishers}
        selectedPublisher={selectedPublisher}
        onSelectPublisher={onSelectPublisher}
      />

      {feedError && !feedLoading && filteredNews.length === 0 ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center text-red-800">
          <p className="font-medium">Не удалось загрузить ленту</p>
          <p className="mt-1 text-sm text-red-700">{feedError}</p>
        </div>
      ) : feedLoading && filteredNews.length === 0 ? (
        <div className="py-16 text-center text-gray-500">Загрузка ленты…</div>
      ) : filteredNews.length > 0 ? (
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
