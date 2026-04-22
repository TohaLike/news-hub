/** Фиксированный список рубрик для материалов и фильтра ленты. */
export const NEWS_RUBRICS = [
  'Технологии',
  'Бизнес',
  'Спорт',
  'Наука',
  'Политика',
  'Культура',
  'Общество',
  'Мир',
  'Здоровье',
  'Авто',
] as const;

export type NewsRubric = (typeof NEWS_RUBRICS)[number];

export const DEFAULT_RUBRIC: NewsRubric = NEWS_RUBRICS[0];
