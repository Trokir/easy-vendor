# Easy Vendor

EasyVendor - это веб-приложение для управления взаимоотношениями с поставщиками, которое упрощает процесс закупок, контрактов и оценки поставщиков.

## Содержание

- [Установка](#установка)
- [Использование](#использование)
- [Структура проекта](#структура-проекта)
- [Технологии](#технологии)
- [API](#api)
- [Лицензия](#лицензия)
- [Контакты](#контакты)

## Установка

### Предварительные требования

- Node.js v18+
- npm v9+
- PostgreSQL 14+

### Установка зависимостей

```bash
npm install
```

### Настройка окружения

1. Создайте файл `.env` в корне проекта
2. Добавьте следующие переменные окружения:

```
# База данных
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=easyvendor

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d

# SendGrid (для отправки электронной почты)
SENDGRID_API_KEY=your_sendgrid_api_key
```

### Запуск миграций

```bash
npm run migration:run
```

## Использование

### Запуск в режиме разработки

```bash
npm start
```

### Сборка для продакшн

```bash
npm run build
```

## Структура проекта

```
easy-vendor/
├── public/                     # Статические файлы
├── src/
│   ├── components/             # React компоненты
│   │   ├── auth/               # Компоненты аутентификации
│   │   ├── common/             # Общие компоненты
│   │   ├── dashboard/          # Компоненты дашборда
│   │   ├── layout/             # Компоненты разметки
│   │   ├── legal/              # Компоненты для юридических страниц
│   │   ├── vendors/            # Компоненты для работы с поставщиками
│   │   └── ...                 # Остальные компоненты
│   ├── contexts/               # React контексты
│   ├── dto/                    # Data Transfer Objects
│   ├── entities/               # Сущности TypeORM
│   ├── hooks/                  # Пользовательские React хуки
│   ├── migrations/             # Миграции базы данных
│   ├── modules/                # NestJS модули
│   ├── pages/                  # Страницы приложения
│   ├── services/               # Сервисы
│   ├── styles/                 # Стили
│   ├── types/                  # TypeScript типы
│   ├── utils/                  # Утилиты
│   ├── App.tsx                 # Главный компонент
│   └── index.tsx               # Точка входа
├── .env                        # Переменные окружения
├── .gitignore                  # Файлы, игнорируемые git
├── package.json                # Зависимости и скрипты
├── README.md                   # Документация проекта
└── tsconfig.json               # Конфигурация TypeScript
```

## Технологии

### Фронтенд
- React 18
- TypeScript
- Material UI 5
- React Router 6
- Axios

### Бэкенд
- NestJS
- TypeORM
- PostgreSQL
- JWT
- SendGrid

## API

### Аутентификация

```
POST /api/auth/register - Регистрация нового пользователя
POST /api/auth/login - Вход в систему
POST /api/auth/refresh - Обновление токена
```

### Поставщики

```
GET /api/vendors - Получение списка поставщиков
GET /api/vendors/:id - Получение информации о поставщике
POST /api/vendors - Создание нового поставщика
PUT /api/vendors/:id - Обновление информации о поставщике
DELETE /api/vendors/:id - Удаление поставщика
```

### Контракты

```
GET /api/contracts - Получение списка контрактов
GET /api/contracts/:id - Получение информации о контракте
POST /api/contracts - Создание нового контракта
PUT /api/contracts/:id - Обновление информации о контракте
DELETE /api/contracts/:id - Удаление контракта
```

### Оценки

```
GET /api/evaluations - Получение списка оценок
GET /api/evaluations/:id - Получение информации об оценке
POST /api/evaluations - Создание новой оценки
PUT /api/evaluations/:id - Обновление информации об оценке
DELETE /api/evaluations/:id - Удаление оценки
```

## Лицензия

MIT

## Контакты

Если у вас есть вопросы или предложения, пожалуйста, свяжитесь с нами:

- Email: info@easyvendor.com
- Website: https://easyvendor.com
