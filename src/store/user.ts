import { observable, action, computed, makeObservable } from 'mobx';
import {
  hydrateStore,
  makePersistable,
  clearPersistedStore,
} from 'mobx-persist-store';
import { InAppPurchase } from 'expo-in-app-purchases';
import * as CloudStore from 'react-native-cloud-store';

import User from '@/services/database/entities/user.entity';

export const enum UserRole {
  /** 普通用户 */
  NORMAL = 1,
  /** 会员 */
  VIP,
}

export class UserStore implements IStore {
  @observable current?: User;
  @observable ghostUser?: Partial<User>;
  @observable purchaseResults?: InAppPurchase[];

  @computed
  get userRole(): UserRole {
    return this.purchaseResults?.length ? UserRole.VIP : UserRole.NORMAL;
  }

  constructor() {
    makeObservable(this);
    makePersistable(this, {
      name: 'User',
      properties: ['purchaseResults'],
    });
    // CloudStore.onICloudKVStoreRemoteChange(data => {});
  }

  @action setCurrent(user: User): void {
    this.current = user;
  }

  @action setPurchaseResults(purchaseResults: InAppPurchase[]): void {
    this.purchaseResults = purchaseResults;
  }

  @action setGhostUser(user: Partial<User>): void {
    this.ghostUser = {
      ...this.ghostUser,
      ...user,
    };
  }

  async hydrate(): PVoid {
    return hydrateStore(this);
  }

  async clearPersisted(): PVoid {
    return clearPersistedStore(this);
  }
}

const userStore = new UserStore();

export default userStore;
