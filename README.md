# FaraX — Backend (ASP.NET Core / .NET 10)

Production-grade бэкенд для платформы продажи одежды в стиле ASOS.
Clean Architecture (4 слоя), MongoDB, JWT (access + refresh), FluentValidation, Swagger.
API полностью stateless — один и тот же контракт переиспользуется веб-фронтом (`apps/web`) и будущим Expo-приложением (`apps/mobile`).

> Это **первый слой поставки** — бэкенд. Веб-фронт (React + Vite) идёт следующим сообщением.

---

## Стек

- **.NET 10**, ASP.NET Core Web API
- **Clean Architecture**: `Domain` → `Application` → `Infrastructure` → `Api`
- **MongoDB** через `MongoDB.Driver` (репозитории в `Infrastructure`)
- **JWT** (access + refresh, ротация refresh-токенов), пароли через **BCrypt.Net-Next**
- **FluentValidation** (глобальный action-filter)
- **Swagger / OpenAPI** (для генерации TS-клиента под веб и мобайл)
- **CORS** настроен под фронт

---

## Структура

```
apps/api
├─ FaraX.sln
├─ .env.example
├─ Directory.Build.props        # net10.0, nullable, implicit usings
└─ src
   ├─ FaraX.Domain              # сущности, enum-ы, базовый Entity
   ├─ FaraX.Application         # DTO, интерфейсы, сервисы (бизнес-логика), валидаторы
   ├─ FaraX.Infrastructure      # Mongo (контекст, репозитории, индексы), JWT, BCrypt, seed
   └─ FaraX.Api                 # контроллеры, middleware, Program.cs, конфиг
```

Слои зависят строго внутрь: `Api` → `Infrastructure` + `Application`; `Infrastructure` → `Application` + `Domain`; `Application` → `Domain`; `Domain` ни от чего.

---

## Подготовка

### 1. Установи .NET 10 SDK
https://dotnet.microsoft.com/download/dotnet/10.0

Проверка:
```bash
dotnet --version   # 10.x
```

### 2. Подними MongoDB
Локально (Docker):
```bash
docker run -d --name farax-mongo -p 27017:27017 mongo:7
```
Либо используй MongoDB Atlas — просто подставь его connection string в `.env`.

### 3. Создай `.env`
Скопируй пример и подставь свои значения:
```bash
cd apps/api
cp .env.example .env
```

`.env` (объяснение полей):

| Переменная | Назначение |
|---|---|
| `MONGODB_URI` | строка подключения Mongo (обязательна) |
| `MONGO_DB` | имя базы (по умолчанию `farax`) |
| `JWT_SECRET` | длинный случайный секрет, **≥ 32 символа** (обязателен) |
| `JWT_ISSUER` / `JWT_AUDIENCE` | issuer/audience токена |
| `JWT_ACCESS_MINUTES` | TTL access-токена (мин) |
| `JWT_REFRESH_DAYS` | TTL refresh-токена (дни) |
| `CORS_ORIGINS` | origin-ы фронта через запятую |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | креды тестового админа (только для seed) |

Сгенерировать секрет:
```bash
openssl rand -base64 48
```

> `.env` уже в `.gitignore` — секреты не попадут в репозиторий. В коде всё читается через `IConfiguration` / переменные окружения, ничего не захардкожено.

---

## Запуск

### Восстановить пакеты и собрать
```bash
cd apps/api
dotnet restore
dotnet build
```

### Залить seed-данные
8 брендов, дерево категорий Women/Men, 12+ товаров (несколько цветов/размеров, часть на sale, часть New In), 1 админ.

```bash
# из apps/api
dotnet run --project src/FaraX.Api -- seed

# пересоздать с нуля (дропнуть коллекции и засидить заново):
dotnet run --project src/FaraX.Api -- seed --reset
```

### Поднять API
```bash
dotnet run --project src/FaraX.Api
```

- API: `http://localhost:5080`
- Swagger UI: `http://localhost:5080/swagger`
- Индексы Mongo создаются автоматически при старте.

---

## Эндпоинты (кратко)

**Каталог (публичные)**
- `GET /api/products` — листинг с фильтрами/сортировкой/пагинацией и фасетами
  параметры: `gender, category(slug), categoryId, sizes, colors, brands` (csv), `minPrice, maxPrice, onSale, isNew, q, sort` (`recommended|newIn|priceAsc|priceDesc`), `limit` (1..60), `offset`
- `GET /api/products/{slug}` — карточка + related
- `GET /api/products/new-in`, `GET /api/products/trending`
- `GET /api/categories/tree?gender=women|men` — дерево категорий
- `GET /api/brands`
- `GET /api/search/suggest?q=...` — автокомплит (товары/бренды/категории)

**Auth**
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me` 🔒

**Корзина** (гость по заголовку `X-Cart-Token`, либо авторизованный пользователь)
- `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{sku}`, `DELETE /api/cart/items/{sku}`
- `POST /api/cart/merge` 🔒 — слияние гостевой корзины с пользовательской при логине

**Wishlist** 🔒
- `GET /api/wishlist`, `POST /api/wishlist`, `DELETE /api/wishlist/{productId}`

**Заказы** 🔒
- `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/{id}`

**Admin** 🔒 (роль `admin`)
- `POST /api/admin/products`, `PUT /api/admin/products/{id}`, `DELETE /api/admin/products/{id}`
- `GET /api/admin/orders`, `PUT /api/admin/orders/{id}/status`

🔒 — требует `Authorization: Bearer <access_token>`.

---

## Заметки

- **Гостевая корзина:** фронт генерит токен, шлёт его в `X-Cart-Token`. После логина — `POST /api/cart/merge` сливает гостевую корзину в пользовательскую.
- **Цены:** `priceSnapshot` фиксируется при добавлении в корзину; при чекауте товары/цены/картинки снимаются снапшотом в заказ, сток списывается по вариантам.
- **Оплата** — мок (`paymentStatus = paid`), точка интеграции реального провайдера — в `OrderService.CheckoutAsync`.
- **Decimal:** деньги сериализуются в Mongo как `Decimal128` (без потери точности).
- **Перебрендинг:** визуальные токены живут на фронте; бэкенд бренд-нейтрален.

---

## Дальше

1. **`apps/web`** — React 18 + Vite + TS, mobile-first (следующее сообщение, приоритет).
2. **`apps/mobile`** — Expo-заглушка, клиент генерится из этого же OpenAPI.
