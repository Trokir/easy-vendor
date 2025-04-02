# Тестирование в проекте Easy Vendor

## Обзор

В проекте используется Jest для тестирования как фронтенда, так и бэкенда. Тесты разделены на две категории:

- **Бэкенд тесты** - для сервисов, контроллеров и модулей NestJS
- **Фронтенд тесты** - для React компонентов и хуков

## Структура тестов

```
src/
├── tests/
│   ├── unit/
│   │   ├── services/         # Тесты сервисов
│   │   ├── controllers/      # Тесты контроллеров
│   │   └── components/       # Тесты React компонентов 
│   ├── integration/          # Интеграционные тесты
│   └── utils/                # Вспомогательные утилиты для тестов
├── components/
│   └── **/*.test.tsx         # Тесты компонентов (размещены рядом с компонентами)
└── mocks/                    # Моки для тестирования
    ├── axios-mock.js         # Мок для axios
    ├── sendgrid-mock.js      # Мок для @sendgrid/mail
    ├── repositories.ts       # Моки репозиториев TypeORM
    └── context.tsx           # Мок контекста React
```

## Запуск тестов

```bash
# Запуск всех тестов
npm test

# Запуск тестов бэкенда
npm run test:backend

# Запуск тестов фронтенда
npm run test:frontend

# Запуск конкретного тестового файла
npm test -- --testPathPattern=path/to/test/file.spec.ts

# Запуск тестов с отслеживанием изменений
npm run test:watch
```

## Тестирование бэкенда

### Тестирование сервисов

Для тестирования сервисов используется следующий шаблон:

```typescript
// src/tests/unit/services/your-service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { YourService } from '../../../services/your.service';
import { YourEntity } from '../../../entities/your.entity';

describe('YourService', () => {
  let service: YourService;
  let repository;

  // Создаем мок репозитория
  const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  });

  beforeEach(async () => {
    // Инициализируем репозиторий
    const mockRepository = createMockRepository();
    
    // Создаем тестовый модуль
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        YourService,
        {
          provide: getRepositoryToken(YourEntity),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<YourService>(YourService);
    repository = mockRepository;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Тест для метода findAll
  describe('findAll', () => {
    it('should return an array of entities', async () => {
      // Arrange
      const results = [{ id: 1 }, { id: 2 }];
      repository.find.mockResolvedValue(results);
      
      // Act
      const entities = await service.findAll();
      
      // Assert
      expect(entities).toEqual(results);
      expect(repository.find).toHaveBeenCalled();
    });
  });
});
```

### Тестирование контроллеров

```typescript
// src/tests/unit/controllers/your-controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { YourController } from '../../../controllers/your.controller';
import { YourService } from '../../../services/your.service';

describe('YourController', () => {
  let controller: YourController;
  let service: YourService;

  beforeEach(async () => {
    // Создаем мок сервиса
    const mockService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    // Создаем тестовый модуль
    const module: TestingModule = await Test.createTestingModule({
      controllers: [YourController],
      providers: [
        {
          provide: YourService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<YourController>(YourController);
    service = module.get<YourService>(YourService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of entities', async () => {
      // Arrange
      const result = [{ id: 1 }, { id: 2 }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      // Act
      const entities = await controller.findAll();

      // Assert
      expect(entities).toBe(result);
      expect(service.findAll).toHaveBeenCalled();
    });
  });
});
```

## Тестирование фронтенда

### Тестирование React компонентов

```typescript
// src/tests/unit/components/your-component.spec.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import YourComponent from '../../../components/YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    // Arrange & Act
    render(<YourComponent />);
    
    // Assert
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click events', async () => {
    // Arrange
    const mockFn = jest.fn();
    render(<YourComponent onClick={mockFn} />);
    
    // Act
    fireEvent.click(screen.getByRole('button'));
    
    // Assert
    expect(mockFn).toHaveBeenCalled();
  });

  it('shows loading state', async () => {
    // Arrange
    render(<YourComponent isLoading={true} />);
    
    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

### Тестирование с моками

Для тестирования компонентов, которые взаимодействуют с внешними сервисами, используйте моки:

```typescript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import YourComponent from '../../../components/YourComponent';

// Используем мок для axios из jest.config.js
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('YourComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads and displays data', async () => {
    // Arrange
    const mockData = [{ id: 1, name: 'Item 1' }];
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });
    
    // Act
    render(<YourComponent />);
    
    // Ждем загрузки данных
    await waitFor(() => {
      expect(screen.getByText('Item 1')).toBeInTheDocument();
    });
    
    // Assert
    expect(mockedAxios.get).toHaveBeenCalledWith('/api/items');
  });

  it('handles errors', async () => {
    // Arrange
    mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));
    
    // Act
    render(<YourComponent />);
    
    // Assert
    await waitFor(() => {
      expect(screen.getByText('Error loading data')).toBeInTheDocument();
    });
  });
});
```

## Лучшие практики

1. **Используйте AAA-паттерн (Arrange-Act-Assert)** - разделяйте тест на эти три фазы для лучшей читаемости

2. **Мокируйте внешние зависимости** - не тестируйте внешние сервисы, используйте моки

3. **Изолируйте тесты** - каждый тест должен быть независимым от других

4. **Используйте jest.spyOn() вместо прямого доступа к методам** - это обеспечивает лучший контроль

5. **Учитывайте асинхронность** - используйте async/await, waitFor() для асинхронных операций

6. **Тестируйте пограничные случаи** - не забывайте о проверке ошибок, пустых значений и других особых случаях

## Устранение неполадок

Если тесты падают, проверьте следующее:

1. **Правильно ли настроены репозитории TypeORM** - используйте createMockRepository()

2. **Проблемы с ES-модулями** - убедитесь, что используются моки для axios, @sendgrid/mail и других ES-модулей

3. **Асинхронные операции** - используйте waitFor() для ожидания обновления UI или результатов асинхронных операций

4. **Контексты React** - оборачивайте компоненты в соответствующие провайдеры контекста

Дополнительную информацию по устранению неполадок смотрите в файле `TROUBLESHOOTING.md`. 