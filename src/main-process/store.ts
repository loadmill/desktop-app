import ElectronStore from 'electron-store';

const Store = {
  _store: null as ElectronStore,
};

export const initStore = (): void => {
  Store._store = new ElectronStore({
    encryptionKey: 'obfuscating',
  });
};

export const set = (key: string, value?: string): void => {
  Store._store.set(key, value);
};

export const get = (key: string): string | undefined => {
  return Store._store.get(key) as string | undefined;
};
