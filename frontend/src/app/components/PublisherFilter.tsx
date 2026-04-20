import { ImageWithFallback } from './figma/ImageWithFallback';

interface Publisher {
  id: number;
  name: string;
  logo: string;
}

interface PublisherFilterProps {
  publishers: Publisher[];
  selectedPublisher: number | null;
  onSelectPublisher: (id: number | null) => void;
}

export function PublisherFilter({ publishers, selectedPublisher, onSelectPublisher }: PublisherFilterProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h3 className="mb-4">Издательства</h3>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSelectPublisher(null)}
          className={`px-4 py-2 rounded-full transition-colors ${
            selectedPublisher === null 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Все
        </button>
        
        {publishers.map((publisher) => (
          <button
            key={publisher.id}
            onClick={() => onSelectPublisher(publisher.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              selectedPublisher === publisher.id 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <ImageWithFallback 
              src={publisher.logo} 
              alt={publisher.name}
              className="w-5 h-5 rounded-full object-cover"
            />
            {publisher.name}
          </button>
        ))}
      </div>
    </div>
  );
}
