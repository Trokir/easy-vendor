## Тестирование

### Запуск тестов

Проект включает тесты для бэкенда и фронтенда. Используйте следующие команды для запуска тестов:

```bash
# Запуск всех тестов
npm test

# Запуск только тестов бэкенда
npm run test:backend

# Запуск только тестов фронтенда
npm run test:frontend

# Запуск тестов с отслеживанием изменений
npm run test:watch

# Запуск тестов для конкретного файла или директории
npm test -- --testPathPattern=path/to/test
```

### Структура тестов

Тесты организованы следующим образом:

- `src/tests/unit/` - модульные тесты
  - `controllers/` - тесты контроллеров
  - `services/` - тесты сервисов
  - `components/` - тесты React-компонентов
- `src/tests/integration/` - интеграционные тесты
- `src/components/**/*.test.tsx` - тесты компонентов рядом с файлами компонентов

### Моки и вспомогательные утилиты

Для тестирования используются следующие вспомогательные файлы:

- `src/mocks/axios-mock.js` - мок для axios
- `src/mocks/sendgrid-mock.js` - мок для @sendgrid/mail
- `src/mocks/repositories.ts` - моки для TypeORM-репозиториев
- `src/mocks/context.tsx` - мок для React-контекста
- `src/tests/utils/test-helpers.ts` - вспомогательные функции для тестов

### Конфигурация Jest

Проект использует три файла конфигурации Jest:

- `jest.config.js` - основной файл конфигурации
- `jest.backend.config.js` - конфигурация для тестов бэкенда
- `jest.frontend.config.js` - конфигурация для тестов фронтенда

При добавлении новых тестов убедитесь, что они правильно настроены в соответствующем файле конфигурации.

### Рекомендации по написанию тестов

1. Используйте AAA-паттерн (Arrange-Act-Assert):
   ```typescript
   it('should do something', async () => {
     // Arrange - подготовка данных
     const input = { /* ... */ };
     
     // Act - выполнение тестируемого действия
     const result = await service.doSomething(input);
     
     // Assert - проверка результатов
     expect(result).toEqual(expected);
   });
   ```

2. Мокируйте зависимости:
   ```typescript
   // Мокирование сервиса
   jest.spyOn(service, 'method').mockResolvedValue(mockResult);
   
   // Мокирование репозитория
   repository.find.mockResolvedValue(mockEntities);
   ```

3. Тестируйте исключения:
   ```typescript
   await expect(service.method()).rejects.toThrow(SpecificError);
   ```

4. Для компонентов используйте React Testing Library:
   ```typescript
   import { render, screen, fireEvent } from '@testing-library/react';
   
   test('renders component', () => {
     render(<Component />);
     expect(screen.getByText('Expected Text')).toBeInTheDocument();
   });
   ``` 