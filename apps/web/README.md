# FaraX — Web (React 18 + Vite + TypeScript)

Production-grade веб-витрина магазина одежды в стиле ASOS. Mobile-first, дизайн на токенах (легко ребрендить), полностью на контракте API из `apps/api`.

## Стек

- **React 18** + **Vite 5** + **TypeScript** (strict)
- **React Router v6** — маршрутизация
- **TanStack Query v5** — серверный стейт (товары, корзина, вишлист, заказы)
- **Zustand v5** — UI-стейт (дроверы, пол, недавно просмотренные, тосты)
- **Tailwind CSS v3** — стили через CSS-переменные (design tokens)
- Иконки — инлайновый SVG-набор (без сторонних библиотек)

Фильтры каталога синхронизированы с URL (`useSearchParams`) — ссылку на отфильтрованную выдачу можно копировать и шарить.

## Требования

- **Node.js 18+** (рекомендуется 20+)
- Запущенный бэкенд `apps/api` (по умолчанию `http://localhost:5080`)

## Переменные окружения

Файл `.env.development` уже создан:

```
VITE_API_URL=http://localhost:5080
```

Для прод-сборки создайте `.env.production` (или задайте `VITE_API_URL` в окружении CI) с адресом боевого API. См. `.env.example`.

## Запуск

```bash
# из папки apps/web
npm install
npm run dev        # http://localhost:5173
```

Прод-сборка и предпросмотр:

```bash
npm run build      # tsc --noEmit + vite build -> dist/
npm run preview    # локальный предпросмотр собранного бандла
```

## ВАЖНО: порядок запуска

1. **Сначала поднять бэкенд** `apps/api` на `:5080` и засеять данные:
   ```bash
   # из apps/api
   dotnet run --project src/FaraX.Api -- seed
   dotnet run --project src/FaraX.Api
   ```
2. Убедиться, что в API включён **CORS** для `http://localhost:5173` (переменная `CORS_ORIGINS` в `.env` бэкенда — уже стоит по умолчанию).
3. Затем запустить веб: `npm run dev`.

Без запущенного API страницы откроются, но списки товаров/каталог будут пустыми (запросы вернут ошибку — покажется состояние ошибки с кнопкой «Retry»).

## Аккаунты

- Обычный пользователь — регистрация через `/register`.
- Админ — сидовый аккаунт из бэкенда (`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`, по умолчанию `admin@farax.local` / `ChangeMe123!`). После входа доступна панель `/admin` (товары + заказы).

Гостевая корзина живёт по токену (`X-Cart-Token`) в `localStorage`; при входе она автоматически мёржится с корзиной аккаунта.

## Структура

```
src/
  api/          обёртки над эндпоинтами (products, catalog, auth, cart, wishlist, orders, admin)
  components/
    ui/         примитивы (Button, Drawer, Modal, Badge, Accordion, PriceRange, Toaster, иконки…)
    common/     EmptyState, ErrorState, RecentlyViewed
    product/    ProductCard (hover-swap), ProductGrid, ProductRail, ColorSwatches, ProductImage
    layout/     Header (+MegaMenu, поиск), MobileMenu, Footer, Layout
    cart/        CartDrawer, CartLineItem
    plp/         FilterSidebar, FilterDrawer, ActiveFilters, SortSelect, FacetGroup
    pdp/         Gallery (zoom), SizeSelector, SizeGuideModal, ProductAccordions
  hooks/        useProducts, useCatalog, useCart, useWishlist, useAuth, useOrders, useAdmin…
  lib/          api-клиент (авто-refresh токена), utils, storage, queryClient
  pages/        Home, Listing (PLP), Product (PDP), Cart, Checkout, Wishlist,
                Login, Register, Account, Orders, OrderDetail, NotFound, admin/*
  store/        uiStore, authStore, recentStore, toastStore
  types/        api.ts — типы под все DTO бэкенда
  router.tsx    маршруты + guard авторизации
  main.tsx      точка входа
```

## Возможности

- Главная: hero Women/Men, полки «New in» и «Trending», категории, недавно просмотренные.
- Каталог (PLP): фасетные фильтры (размер/цвет/бренд/цена/скидки/новинки), сортировка, бесконечная подгрузка, фильтры в URL.
- Карточка товара (PDP): галерея с зумом, выбор цвета/размера по вариантам, контроль стока, добавление в корзину и вишлист, «Complete the look».
- Корзина: дровер + полная страница, изменение количества с учётом остатков.
- Оформление заказа: способ доставки (standard/express/pickup), адрес (подставляется из профиля), демо-оплата.
- Аккаунт: заказы, детали заказа, сохранённые адреса, вишлист.
- Админка: CRUD товаров (цвета/варианты через JSON-редактор) и смена статусов заказов.

## Ребрендинг

Все цвета/шрифты/скругления — CSS-переменные в `src/index.css` (`:root`) и маппинг в `tailwind.config.js`. Меняются в одном месте: акцентный цвет, фон, текст, радиусы, семейства шрифтов (`--font-display`, `--font-body`).
