import React from 'react';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';

import './_persist';
import uiStore from './ui';
import userStore from './user';
import globalStore from './global';
import albumStore from './album';

export const stores = {
  ui: uiStore,
  user: userStore,
  global: globalStore,
  album: albumStore,
};

export const storeContext = React.createContext(stores);
export const useStore = () => React.useContext(storeContext);

export const withStores = (C: NavigationFunctionComponent) => {
  return (props: NavigationComponentProps): React.ReactElement => {
    return (
      <storeContext.Provider value={stores}>
        <C {...props} />
      </storeContext.Provider>
    );
  };
};

export async function hydrateStores(): PVoid {
  for (const key in stores) {
    const store = stores[key];
    if (store.hydrate) {
      await store.hydrate();
    }
  }
}

export async function clearPersistedStores(): PVoid {
  for (const key in stores) {
    const store = stores[key];
    if (store.clearPersisted) {
      await store.clearPersisted();
    }
  }
}
