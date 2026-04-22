/** Должен совпадать с `frontend/src/app/constants/rubrics.ts`. */
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
