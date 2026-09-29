# Деплой на Vercel

## Почему прошлый деплой упал

Проект собирался через **vinext** (Cloudflare Workers): `npm run build` клал результат в
`dist/server` + `dist/client`, а не в `.next`. Vercel видел в зависимостях `next@16.3.4`,
запускал свой `vercel build` и падал на отсутствующем `.next/routes-manifest.json`.
Плюс `app/api/request/route.ts` импортировал `cloudflare:workers`, а D1-биндинги
существуют только в Cloudflare.

Теперь `npm run build` — это обычный `next build`, и на Vercel всё собирается штатно.
Сборка для ChatGPT Sites сохранена отдельно: `npm run build:sites`.

## Переменные окружения

Задайте их в Vercel → Project → Settings → Environment Variables (Production и Preview):

| Переменная | Обязательна | Назначение |
| --- | --- | --- |
| `DATABASE_URL` | да | Postgres-строка подключения (pooled endpoint) |
| `ADMIN_PASSWORD` | да | пароль для входа в `/admin` |
| `ADMIN_SECRET` | нет | отдельный ключ подписи cookie (по умолчанию берётся `ADMIN_PASSWORD`) |
| `TELEGRAM_BOT_TOKEN` | нет | дублирование заявок в Telegram |
| `TELEGRAM_CHAT_ID` | нет | id чата, куда падают заявки |
| `NEXT_PUBLIC_SITE_URL` | нет | канонический домен; на Vercel определяется сам |

## База данных

1. Vercel → **Storage** → **Create Database** → **Neon** (Postgres). Можно и напрямую в Neon.
2. Скопируйте **pooled** connection string: он содержит `-pooler` в хосте.
3. Положите его в `DATABASE_URL`. Формат: `postgresql://user:pass@host/db?sslmode=require`.
4. Таблицу создавать не нужно: `leads` и индексы создаются автоматически при первом обращении.

Заявка сначала пишется в базу и только потом уходит в Telegram. Если Telegram недоступен,
заявка всё равно сохранена — посетитель видит «Заявка принята и сохранена», а в админке
у такой заявки стоит пометка `Telegram: не отправлено`.

## Админка

Открывается на `/admin`, закрыта `ADMIN_PASSWORD`. Если переменная не задана, страница
показывает, что админка выключена, и никого не пускает.

- список заявок, новые сверху;
- статусы: новая, в работе, завершена, спам;
- телефон кликабельный, видно способ связи, райдер, размер, цвет, комментарий;
- из индексации закрыта: `noindex` в метаданных и `Disallow: /admin` в `robots.txt`.

## Настройки проекта в Vercel

- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output Directory: оставить пустым (`.next` по умолчанию)
- Install Command: `npm install`

После пуша в `main` деплой проходит без ручных шагов.

## Локальная разработка

```bash
npm install
npm run dev          # http://localhost:3000
```

`DATABASE_URL` локально не нужен: если он пуст, используется встроенный Postgres (PGlite)
в каталоге `.pglite/`. Это настоящий Postgres, просто скомпилированный в WASM, — SQL
и поведение совпадают с продакшеном. В продакшене PGlite не подключается никогда.

Для проверки админки добавьте в `.env`:

```
ADMIN_PASSWORD=любой-пароль
```
