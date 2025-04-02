# Настройка проекта Easy Vendor

## Установка

1. Клонирование репозитория:
   ```bash
   git clone https://github.com/your-username/easy-vendor.git
   cd easy-vendor
   ```

2. Установка зависимостей:
   ```bash
   npm install
   ```

3. Настройка переменных окружения:
   ```bash
   cp .env.example .env
   # Отредактируйте файл .env, добавив необходимые настройки
   ```

## Запуск

1. Запуск в режиме разработки:
   ```bash
   npm start
   ```

2. Сборка для продакшена:
   ```bash
   npm run build
   ```

## Тестирование

1. Запуск всех тестов:
   ```bash
   npm test
   ```

2. Запуск тестов бэкенда:
   ```bash
   npm run test:backend
   ```

3. Запуск тестов фронтенда:
   ```bash
   npm run test:frontend
   ```

4. Запуск в режиме CI (без watch-режима):
   ```bash
   set CI=true && npm test
   ```

## Важные компоненты

### Фронтенд

- **AuthProvider** (`src/contexts/AuthContext.tsx`) - управляет состоянием авторизации
- **LegalConsentProvider** (`src/contexts/LegalConsentContext.tsx`) - управляет состоянием согласия
- **Layout** (`src/components/layout/Layout.tsx`) - основной макет приложения

### Бэкенд

- **AuthModule** (`src/modules/auth/auth.module.ts`) - модуль аутентификации
- **EmailService** (`src/services/email.service.ts`) - сервис отправки электронной почты
- **LegalConsentController** (`src/controllers/legal-consent.controller.ts`) - управление согласиями

## Миграции базы данных

1. Создание миграции:
   ```bash
   npm run migration:create src/migrations/MigrationName
   ```

2. Генерация миграции на основе изменений сущностей:
   ```bash
   npm run migration:generate src/migrations/MigrationName
   ```

3. Запуск миграций:
   ```bash
   npm run migration:run
   ```

4. Откат последней миграции:
   ```bash
   npm run migration:revert
   ```

## Линтинг и форматирование

1. Проверка кода:
   ```bash
   npm run lint
   ```

2. Исправление ошибок линтера:
   ```bash
   npm run lint:fix
   ```

3. Форматирование кода:
   ```bash
   npm run format
   ``` 