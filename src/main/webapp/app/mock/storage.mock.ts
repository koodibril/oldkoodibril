export class StorageMock implements Storage {
  public length = 0;
  public clear(): null {
    return null;
  }
  public getItem(key: string): null {
    return null;
  }
  public key(index: number): null {
    return null;
  }
  public removeItem(key: string): null {
    return null;
  }
  public setItem(key: string, value: string): null {
    return null;
  }
}
