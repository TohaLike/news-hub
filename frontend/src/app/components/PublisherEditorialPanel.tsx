import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, FolderKanban, ImageIcon, Layers, Plus, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { EditorialGroup, GroupPublication, Publisher } from '../types';
import {
  createEditorialGroupSchema,
  createGroupPublicationSchema,
  type CreateEditorialGroupValues,
  type CreateGroupPublicationValues,
} from '../schemas/editorial';
import { Button } from './ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { cn } from './ui/utils';
import { ImageWithFallback } from './figma/ImageWithFallback';

const DEFAULT_POST_IMAGE =
  'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=450&fit=crop';

export interface PublisherEditorialPanelProps {
  publishers: Publisher[];
  groups: EditorialGroup[];
  publications: GroupPublication[];
  onCreateGroup: (payload: { name: string; publisherId: number }) => void;
  onCreatePublication: (
    groupId: string,
    payload: Omit<GroupPublication, 'id' | 'groupId' | 'publishedAt' | 'views' | 'comments'>,
  ) => void;
}

export function PublisherEditorialPanel({
  publishers,
  groups,
  publications,
  onCreateGroup,
  onCreatePublication,
}: PublisherEditorialPanelProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  const groupForm = useForm<CreateEditorialGroupValues>({
    resolver: zodResolver(createEditorialGroupSchema),
    defaultValues: {
      name: '',
      publisherId: publishers[0]?.id ?? 1,
    },
  });

  const postForm = useForm<CreateGroupPublicationValues>({
    resolver: zodResolver(createGroupPublicationSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: '',
      image: '',
    },
  });

  useEffect(() => {
    if (groups.length === 0) {
      setSelectedGroupId(null);
      return;
    }
    setSelectedGroupId((prev) => {
      if (prev && groups.some((g) => g.id === prev)) return prev;
      return groups[0]?.id ?? null;
    });
  }, [groups]);

  const selectedGroup = useMemo(
    () => groups.find((g) => g.id === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const publisherById = useMemo(() => {
    const m = new Map<number, Publisher>();
    for (const p of publishers) m.set(p.id, p);
    return m;
  }, [publishers]);

  const postsInGroup = useMemo(
    () => publications.filter((p) => p.groupId === selectedGroupId),
    [publications, selectedGroupId],
  );

  const onSubmitGroup = groupForm.handleSubmit((values) => {
    onCreateGroup({ name: values.name.trim(), publisherId: values.publisherId });
    groupForm.reset({
      name: '',
      publisherId: values.publisherId,
    });
  });

  const onSubmitPost = postForm.handleSubmit((values) => {
    if (!selectedGroupId) return;
    const image = values.image.trim() ? values.image.trim() : DEFAULT_POST_IMAGE;
    onCreatePublication(selectedGroupId, {
      title: values.title.trim(),
      excerpt: values.excerpt.trim(),
      content: values.content.trim(),
      category: values.category.trim(),
      image,
    });
    postForm.reset({
      title: '',
      excerpt: '',
      content: '',
      category: '',
      image: '',
    });
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/90 via-white to-slate-50/80 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-violet-600 text-white shadow-md">
              <Layers className="size-6" strokeWidth={2} aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Редакция и группы</h3>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-gray-600">
                Создайте тематические группы внутри издательства и публикуйте материалы только в
                выбранной группе — так проще вести несколько направлений.
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-violet-800 ring-1 ring-violet-200/70">
            <Sparkles className="size-3.5" aria-hidden />
            Локальный режим
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Колонка групп */}
        <div className="space-y-4 lg:col-span-5">
          <div className="flex items-center justify-between gap-2">
            <h4 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              <FolderKanban className="size-4 text-violet-600" aria-hidden />
              Группы
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-bold text-violet-800 tabular-nums">
                {groups.length}
              </span>
            </h4>
          </div>

          <div className="max-h-[min(52vh,28rem)] space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/50 p-2 pr-1">
            {groups.length === 0 ? (
              <div className="rounded-lg border border-dashed border-violet-200 bg-white px-4 py-10 text-center">
                <Building2 className="mx-auto mb-2 size-10 text-violet-300" strokeWidth={1.25} />
                <p className="text-sm font-medium text-gray-800">Пока нет групп</p>
                <p className="mx-auto mt-1 max-w-xs text-xs text-gray-500">
                  Ниже создайте первую группу и привяжите её к издательству из каталога.
                </p>
              </div>
            ) : (
              groups.map((g) => {
                const pub = publisherById.get(g.publisherId);
                const count = publications.filter((p) => p.groupId === g.id).length;
                const active = g.id === selectedGroupId;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedGroupId(g.id)}
                    className={cn(
                      'w-full rounded-xl border-2 p-3 text-left transition-all duration-200',
                      active
                        ? 'border-violet-500 bg-white shadow-md ring-2 ring-violet-500/15'
                        : 'border-transparent bg-white/80 hover:border-violet-200 hover:bg-white',
                    )}
                  >
                    <div className="flex items-start gap-3">
                      {pub ? (
                        <ImageWithFallback
                          src={pub.logo}
                          alt=""
                          className="size-10 shrink-0 rounded-lg object-cover ring-1 ring-gray-100"
                        />
                      ) : (
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-gray-200 text-xs text-gray-500">
                          ?
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">{g.name}</p>
                        <p className="truncate text-xs text-gray-500">
                          {pub?.name ?? 'Издательство'} · {g.createdAt}
                        </p>
                        <p className="mt-1 text-xs font-medium text-violet-700">
                          Публикаций: {count}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Plus className="size-4 text-violet-600" aria-hidden />
              Новая группа
            </h4>
            <Form {...groupForm}>
              <form onSubmit={onSubmitGroup} className="space-y-4">
                <FormField
                  control={groupForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название группы</FormLabel>
                      <FormControl>
                        <Input placeholder="Например: Технологии и ИИ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={groupForm.control}
                  name="publisherId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Издательство</FormLabel>
                      <FormControl>
                        <select
                          className={cn(
                            'flex h-10 w-full rounded-md border border-input bg-input-background px-3 py-2 text-sm',
                            'ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                          )}
                          value={String(field.value)}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        >
                          {publishers.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-violet-600 hover:bg-violet-700"
                  disabled={groupForm.formState.isSubmitting}
                >
                  {groupForm.formState.isSubmitting ? 'Создание…' : 'Создать группу'}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        {/* Публикации в группе */}
        <div className="space-y-4 lg:col-span-7">
          {!selectedGroup ? (
            <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-6 py-12 text-center">
              <Layers className="mb-3 size-12 text-gray-300" strokeWidth={1.25} />
              <p className="font-medium text-gray-800">Выберите группу слева</p>
              <p className="mt-1 max-w-sm text-sm text-gray-500">
                Публикации можно создавать только после выбора группы — так материал всегда
                привязан к тематике и издательству.
              </p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
                      Активная группа
                    </p>
                    <h4 className="mt-1 text-xl font-bold text-gray-900">{selectedGroup.name}</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Издательство:{' '}
                      <span className="font-medium text-gray-900">
                        {publisherById.get(selectedGroup.publisherId)?.name ?? '—'}
                      </span>
                    </p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    Материалов: {postsInGroup.length}
                  </span>
                </div>
              </div>

              <div className="max-h-[min(40vh,22rem)] space-y-3 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50/40 p-3">
                {postsInGroup.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-500">
                    В этой группе пока нет публикаций — добавьте первую ниже.
                  </p>
                ) : (
                  postsInGroup.map((post) => (
                    <article
                      key={post.id}
                      className="overflow-hidden rounded-xl border border-white bg-white shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative h-28 shrink-0 sm:w-36">
                          <ImageWithFallback
                            src={post.image}
                            alt=""
                            className="size-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1 p-3 sm:p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-md bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-800">
                              {post.category}
                            </span>
                            <span className="text-xs text-gray-400">{post.publishedAt}</span>
                          </div>
                          <h5 className="mt-1 font-semibold text-gray-900">{post.title}</h5>
                          <p className="mt-1 line-clamp-2 text-sm text-gray-600">{post.excerpt}</p>
                          <p className="mt-2 text-xs text-gray-500">
                            {post.views} просмотров · {post.comments} комментариев
                          </p>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <h4 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <ImageIcon className="size-4 text-violet-600" aria-hidden />
                  Новая публикация в группе
                </h4>
                <p className="mb-4 text-xs text-gray-500">
                  Материал появится только в группе «{selectedGroup.name}».
                </p>
                <Form {...postForm}>
                  <form onSubmit={onSubmitPost} className="space-y-4">
                    <FormField
                      control={postForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Заголовок</FormLabel>
                          <FormControl>
                            <Input placeholder="Заголовок новости" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={postForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Рубрика</FormLabel>
                          <FormControl>
                            <Input placeholder="Например: Технологии" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={postForm.control}
                      name="excerpt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Лид / краткое описание</FormLabel>
                          <FormControl>
                            <Textarea placeholder="2–3 предложения для карточки в ленте" rows={3} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={postForm.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Полный текст</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Основной текст материала" rows={8} className="min-h-40" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={postForm.control}
                      name="image"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL обложки (необязательно)</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://…" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-violet-600 hover:bg-violet-700"
                      disabled={postForm.formState.isSubmitting}
                    >
                      {postForm.formState.isSubmitting ? 'Публикация…' : 'Опубликовать в группе'}
                    </Button>
                  </form>
                </Form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
