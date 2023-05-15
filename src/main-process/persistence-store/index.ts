import ElectronStore from 'electron-store';

import { Token } from '../../types/token';

const Store = {
  _store: null as ElectronStore,
};

export const initStore = (): void => {
  Store._store = new ElectronStore({
    encryptionKey: 'obfuscating',
  });
};

export const set = (key: string, value?: StoreValue): void => {
  Store._store.set(key, value);
};

export const get = <V extends StoreValue>(key: string): V => {
  return Store._store.get(key) as V;
};

export type StoreValue = string | Token;
