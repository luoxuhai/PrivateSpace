import { observable, makeObservable, action } from 'mobx';
import {
  hydrateStore,
  makePersistable,
  clearPersistedStore,
} from 'mobx-persist-store';

interface IPhotoViewConfig {
  // 视图
  view: 'list' | 'gallery';
  //排序
  sort: {
    field: string;
    /**
     * desc： 倒序
     *
     * asc：正序
     */
    order: 'desc' | 'asc';
  };
}

export class AlbumStore implements IStore {
  @observable photoViewConfig?: IPhotoViewConfig = {
    view: 'gallery',
    sort: {
      field: 'ctime',
      order: 'desc',
    },
  };
  // 更多菜单显隐
  @observable moreContextVisible = false;
  @observable refetchAlbum = 0;

  constructor() {
    makeObservable(this);
    makePersistable(this, {
      name: 'Album',
      properties: ['photoViewConfig'],
    });
  }

  @action setPhotoViewConfig(photoViewConfig: Partial<IPhotoViewConfig>): void {
    this.photoViewConfig = { ...this.photoViewConfig, ...photoViewConfig };
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

const albumStore = new AlbumStore();

export default albumStore;
