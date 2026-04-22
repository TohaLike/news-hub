export interface Publisher {
  id: number;
  name: string;
  logo: string;
}

export interface News {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  publisher: Publisher;
  category: string;
  views: number;
  comments: number;
  publishedAt: string;
}

export interface Comment {
  id: number;
  newsId: number;
  author: string;
  avatar: string;
  text: string;
  timestamp: string;
  likes: number;
}

/** Роль аккаунта (читатель / издатель), приходит с бэка в /auth/me. */
export type AccountRole = 'reader' | 'publisher';

export interface User {
  name: string;
  email: string;
  avatar: string;
  role: AccountRole;
}

export const publishers: Publisher[] = [
  {
    id: 1,
    name: 'TechNews',
    logo: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=100&fit=crop',
  },
  {
    id: 2,
    name: 'БизнесВести',
    logo: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&h=100&fit=crop',
  },
  {
    id: 3,
    name: 'СпортТайм',
    logo: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=100&h=100&fit=crop',
  },
  {
    id: 4,
    name: 'НаукаСегодня',
    logo: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=100&h=100&fit=crop',
  },
  {
    id: 5,
    name: 'МировыеНовости',
    logo: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=100&h=100&fit=crop',
  },
];

export const initialNews: News[] = [
  {
    id: 1,
    title: 'Революционный прорыв в искусственном интеллекте',
    excerpt:
      'Новая система ИИ демонстрирует беспрецедентные возможности в обработке естественного языка',
    content:
      'Исследователи объявили о крупном прорыве в области искусственного интеллекта. Новая система демонстрирует способности, которые превосходят все предыдущие модели.\n\nОсновные достижения включают улучшенное понимание контекста, способность к многоступенчатым рассуждениям и более естественное взаимодействие с пользователями.\n\nЭксперты считают, что это открытие может изменить многие отрасли, от медицины до образования.',
    image:
      'https://images.unsplash.com/photo-1632507127573-f4098f6f027f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmVha2luZyUyMG5ld3MlMjB0ZWNobm9sb2d5fGVufDF8fHx8MTc3MTQ3MzA1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[0],
    category: 'Технологии',
    views: 15420,
    comments: 234,
    publishedAt: '2 часа назад',
  },
  {
    id: 2,
    title: 'Мировые рынки показывают рост после заявлений ЦБ',
    excerpt:
      'Индексы достигли исторических максимумов на фоне позитивных экономических прогнозов',
    content:
      'Мировые фондовые рынки продемонстрировали значительный рост после заявлений центральных банков о сохранении стимулирующей политики.\n\nОсновные индексы достигли новых исторических максимумов. Инвесторы позитивно отреагировали на экономические прогнозы.\n\nАналитики рекомендуют сохранять осторожность несмотря на текущий оптимизм.',
    image:
      'https://images.unsplash.com/photo-1676119451563-0c4a1a37e019?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMG1lZXRpbmclMjBmaW5hbmNpYWx8ZW58MXx8fHwxNzcxNTM4ODY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[1],
    category: 'Бизнес',
    views: 8930,
    comments: 156,
    publishedAt: '4 часа назад',
  },
  {
    id: 3,
    title: 'Сенсация в чемпионате: аутсайдер обыграл лидера',
    excerpt:
      'Неожиданная победа команды, которая занимала последнее место в турнирной таблице',
    content:
      'В невероятном матче команда-аутсайдер одержала сенсационную победу над лидером чемпионата со счетом 3:1.\n\nЭто поражение может существенно изменить расклад сил в борьбе за первое место. Тренер победившей команды назвал это историческим моментом.\n\nФанаты устроили грандиозное празднование после финального свистка.',
    image:
      'https://images.unsplash.com/photo-1763854413165-1713bc5a7f4a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcG9ydHMlMjBzdGFkaXVtJTIwYWN0aW9ufGVufDF8fHx8MTc3MTUxNDAyNHww&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[2],
    category: 'Спорт',
    views: 12340,
    comments: 445,
    publishedAt: '1 час назад',
  },
  {
    id: 4,
    title: 'Открыта новая экзопланета в обитаемой зоне',
    excerpt: 'Астрономы обнаружили планету, на которой возможна жизнь',
    content:
      'Международная команда астрономов объявила об открытии экзопланеты в обитаемой зоне звезды, похожей на Солнце.\n\nПланета находится на расстоянии 100 световых лет от Земли и обладает условиями, потенциально пригодными для существования жидкой воды.\n\nЭто открытие усиливает надежды на обнаружение внеземной жизни.',
    image:
      'https://images.unsplash.com/photo-1707944746058-4da338d0f827?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzY2llbmNlJTIwbGFib3JhdG9yeSUyMHJlc2VhcmNofGVufDF8fHx8MTc3MTQ4NTc3Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[3],
    category: 'Наука',
    views: 9870,
    comments: 187,
    publishedAt: '5 часов назад',
  },
  {
    id: 5,
    title: 'Саммит мировых лидеров: достигнуты исторические соглашения',
    excerpt: 'Главы государств подписали пакет соглашений по климату и торговле',
    content:
      'На международном саммите мировые лидеры достигли беспрецедентных соглашений по климату и международной торговле.\n\nПодписанные документы предусматривают сокращение выбросов на 50% к 2030 году и создание новых торговых партнерств.\n\nЭксперты называют это важным шагом к глобальному сотрудничеству.',
    image:
      'https://images.unsplash.com/photo-1569441499879-10880df919d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b3JsZCUyMHBvbGl0aWNzJTIwZ292ZXJubWVudHxlbnwxfHx8fDE3NzE1Mzg4NzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[4],
    category: 'Политика',
    views: 11230,
    comments: 312,
    publishedAt: '3 часа назад',
  },
  {
    id: 6,
    title: 'Новый блокбастер установил рекорд кассовых сборов',
    excerpt: 'Фильм собрал $200 миллионов в первые выходные проката',
    content:
      'Долгожданный блокбастер побил все рекорды, собрав невероятную сумму в первый уик-энд проката.\n\nКритики высоко оценили фильм, а зрители устроили овации после просмотров. Режиссер поблагодарил фанатов за поддержку.\n\nСтудия уже анонсировала работу над продолжением.',
    image:
      'https://images.unsplash.com/photo-1763731374068-42a7ce61c3e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbnRlcnRhaW5tZW50JTIwY3VsdHVyZSUyMGZlc3RpdmFsfGVufDF8fHx8MTc3MTUzODg3MXww&ixlib=rb-4.1.0&q=80&w=1080',
    publisher: publishers[0],
    category: 'Развлечения',
    views: 7650,
    comments: 289,
    publishedAt: '6 часов назад',
  },
];

export const initialComments: Comment[] = [
  {
    id: 1,
    newsId: 1,
    author: 'Алексей Иванов',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    text: 'Невероятный прогресс! Интересно, как это повлияет на рынок труда в ближайшие годы.',
    timestamp: '1 час назад',
    likes: 24,
  },
  {
    id: 2,
    newsId: 1,
    author: 'Мария Петрова',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    text: 'Отличная новость! Надеюсь, технологию будут использовать в образовательных целях.',
    timestamp: '45 минут назад',
    likes: 18,
  },
  {
    id: 3,
    newsId: 2,
    author: 'Дмитрий Сидоров',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop',
    text: 'Рынки слишком перегреты. Стоит быть осторожными с инвестициями.',
    timestamp: '2 часа назад',
    likes: 31,
  },
];
