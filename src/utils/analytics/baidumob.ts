import baidustat from 'react-native-baidumobstat';
import * as Application from 'expo-application';

import { ScreenName } from '@/screens';
import globalStore from '@/store/global';

export type PageName = ScreenName | 'Camera';

class Baidumobstat {
  private isRelease = false;

  private get enabled() {
    return this.isRelease && !globalStore.debug;
  }

  constructor() {
    Application.getIosApplicationReleaseTypeAsync().then(type => {
      this.isRelease = type === Application.ApplicationReleaseType.APP_STORE;
    });
  }

  public onPageStart(pageName: PageName): void {
    if (this.enabled) return baidustat.onPageStart(pageName);
  }

  public onPageEnd(pageName: PageName): void {
    if (this.enabled) return baidustat.onPageEnd(pageName);
  }

  public onEvent(id: string): void {
    if (this.enabled)
      return baidustat.onEvent(id, this.enabled ? 'production' : 'test');
  }
}

const baidumobstat = new Baidumobstat();

export default baidumobstat;
