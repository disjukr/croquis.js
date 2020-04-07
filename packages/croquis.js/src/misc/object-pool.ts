export interface CreatePoolConfig<T> {
  createItem: () => T;
  poolSize: number;
}
export interface ObjectPool<T> {
  take(): T;
  give(item: T): void;
}
export function createPool<T>(config: CreatePoolConfig<T>): ObjectPool<T> {
  const items: T[] = [];
  return {
    take() {
      if (items.length) return items.pop()!;
      return config.createItem();
    },
    give(item: T) {
      if (items.length >= config.poolSize) return;
      items.push(item);
    },
  };
}
