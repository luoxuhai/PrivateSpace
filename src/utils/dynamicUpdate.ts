import { Alert, StatusBar } from 'react-native';
import CodePush, { LocalPackage } from 'react-native-code-push';

import { stores } from '@/store';

export class DynamicUpdate {
  static timer?: NodeJS.Timer;
  /**
   * 检查并更新，不会重启应用
   */
  static sync(): void {
    // TODO: 先取消
    return;
    StatusBar.setNetworkActivityIndicatorVisible(true);
    if (stores.global.debug) {
      CodePush.sync(
        {
          updateDialog: {
            optionalIgnoreButtonLabel: '下次再说',
            optionalInstallButtonLabel: '马上体验',
            optionalUpdateMessage: '新版本来袭，是否更新',
            title: '更新提示',
            mandatoryUpdateMessage: '噢，版本中有一些大改动，不得不更新',
            mandatoryContinueButtonLabel: '立即更新',
          },
          installMode: CodePush.InstallMode.IMMEDIATE,
        },
        status => {
          Alert.alert('CodePush.SyncStatus', transformSyncStatus(status));
        },
      ).finally(() => {
        StatusBar.setNetworkActivityIndicatorVisible(false);
      });
    } else {
      CodePush.sync().finally(() => {
        StatusBar.setNetworkActivityIndicatorVisible(false);
      });
    }
  }

  /**
   * 检查并更新，会重启应用
   */
  static checkForUpdate(): void {
    CodePush.checkForUpdate();
  }

  /**
   * 定时检查并更新
   */
  static timingSync(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.timer = setInterval(() => {
      this.sync();
    }, 1000 * 60);
  }

  /**
   * 检索状态与指定updateState参数匹配的已安装更新的元数据
   * @param state RUNNING | PENDING | LATEST
   */
  static getUpdateMetadataAsync(
    state: CodePush.UpdateState = CodePush.UpdateState.RUNNING,
  ): Promise<LocalPackage | null> {
    return CodePush.getUpdateMetadata(state);
  }

  static clear(): void {
    CodePush.clearUpdates();
  }
}

function transformSyncStatus(syncStatus: CodePush.SyncStatus) {
  switch (syncStatus) {
    case CodePush.SyncStatus.CHECKING_FOR_UPDATE:
      return '正在查询 CodePush 服务器以获取更新。';
    case CodePush.SyncStatus.DOWNLOADING_PACKAGE:
      return '正在从 CodePush 服务器下载可用更新。';
    case CodePush.SyncStatus.AWAITING_USER_ACTION:
      return 'Awaiting user action.';
    case CodePush.SyncStatus.INSTALLING_UPDATE:
      return '已下载可用更新，即将安装。';
    case CodePush.SyncStatus.UP_TO_DATE:
      return '该应用程序是CodePush服务器的最新功能。';
    case CodePush.SyncStatus.UPDATE_IGNORED:
      return 'user chose to ignore';
    case CodePush.SyncStatus.UPDATE_INSTALLED:
      return '已安装可用更新并将在 syncStatusChangedCallback 函数返回后或下次应用程序恢复/重新启动时立即运行，具体取决于 SyncOptions 中指定的 InstallMode';
    case CodePush.SyncStatus.UNKNOWN_ERROR:
      return '同步操作遇到未知错误。';
  }
}
