import { Repository, FindOptionsWhere, FindOptionsOrder, DeepPartial } from 'typeorm';

export class MockRepository<T> implements Partial<Repository<T>> {
  private data: T[] = [];

  constructor(initialData: T[] = []) {
    this.data = [...initialData];
  }

  async find(options?: any): Promise<T[]> {
    return this.data;
  }

  async findOne(options: any): Promise<T | null> {
    if (options?.where) {
      const found = this.data.find(item => 
        Object.entries(options.where).every(([key, value]) => 
          (item as any)[key] === value
        )
      );
      return found || null;
    }
    return this.data[0] || null;
  }

  async save(entity: DeepPartial<T>): Promise<T> {
    const index = this.data.findIndex(item => 
      (item as any).id === (entity as any).id
    );
    if (index >= 0) {
      this.data[index] = entity as T;
    } else {
      this.data.push(entity as T);
    }
    return entity as T;
  }

  async create(entityLike: DeepPartial<T>): Promise<T> {
    return entityLike as T;
  }

  async delete(id: string | number): Promise<any> {
    const index = this.data.findIndex(item => 
      (item as any).id === id
    );
    if (index >= 0) {
      this.data.splice(index, 1);
      return { affected: 1 };
    }
    return { affected: 0 };
  }

  async update(id: string | number, partialEntity: DeepPartial<T>): Promise<any> {
    const index = this.data.findIndex(item => 
      (item as any).id === id
    );
    if (index >= 0) {
      this.data[index] = { ...this.data[index], ...partialEntity };
      return { affected: 1 };
    }
    return { affected: 0 };
  }

  createQueryBuilder(alias: string): any {
    return {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
      getMany: jest.fn().mockResolvedValue([]),
      getCount: jest.fn().mockResolvedValue(0),
    };
  }
} 