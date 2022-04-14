import { observable, makeObservable, action } from 'mobx';
import {
  hydrateStore,
  makePersistable,
  clearPersistedStore,
} from 'mobx-persist-store';

type OrderBy = Partial<API.OrderBy<API.AlbumType>>;

export class FileStore implements IStore {
  @observable view: FileView = 'icons';
  @observable orderBy: OrderBy = {
    ctime: 'DESC',
  };
  // 更多菜单显隐
  @observable moreContextVisible = false;
  @observable refetchAlbum = 0;

  constructor() {
    makeObservable(this);
    makePersistable(this, {
      name: 'File',
      properties: ['view', 'orderBy'],
    });
  }

  @action setOrderBy(orderBy: OrderBy): void {
    this.orderBy = orderBy;
  }

  @action setView(view: PhotoView) {
    this.view = view;
  }

  @action setMoreContextVisible(visible: boolean): void {
    this.moreContextVisible = visible;
  }

  @action setRefetchAlbum(value: number): void {
    this.refetchAlbum = value;
  }

  async hydrate(): PVoid {
    return hydrateStore(this);
  }

  async clearPersisted(): PVoid {
    return clearPersistedStore(this);
  }
}

const fileStore = new FileStore();

export default fileStore;
