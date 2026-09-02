export interface DislikesStore {
  add(id: number): boolean;
  has(id: number): boolean;
  list(): number[];
  remove(id: number): boolean;
}

export class InMemoryDislikesStore implements DislikesStore {
  private readonly ids = new Set<number>();

  add(id: number): boolean {
    if (this.ids.has(id)) {
      return false;
    }
    this.ids.add(id);
    return true;
  }

  has(id: number): boolean {
    return this.ids.has(id);
  }

  list(): number[] {
    return [...this.ids];
  }

  remove(id: number): boolean {
    return this.ids.delete(id);
  }
}
