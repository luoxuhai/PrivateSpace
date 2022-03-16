import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Alert } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useTranslation, getI18n } from 'react-i18next';
import { observer } from 'mobx-react';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidDisappear,
} from 'react-native-navigation-hooks';
import {
  useDeviceOrientation,
  useAppState,
} from '@react-native-community/hooks';

import { useStore, stores } from '@/store';
import { EUserType } from '@/services/database/entities/user.entity';
import { services } from '@/services';
import { PermissionManager } from '@/utils';
import { getAppIcon } from '@/utils/designSystem';
import PasscodeKeyboard from '@/components/PasscodeKeyboard';
import { useUpdateEffect } from '@/hooks';
import { AppLaunchType } from '@/config';

import IconTouchID from '@/assets/icons/touchid.svg';
import IconFaceID from '@/assets/icons/faceid.svg';

/** 密码输入状态 */
export const enum EInputType {
  /** 新建密码  */
  Create,
  /** 修改密码 */
  Change,
  /** 验证密码 */
  Verify,
}

const enum EInputStage {
  /** 开始 */
  Start,
  /** 确认密码 */
  Confirm,
  /** 完成 */
  Done,
}

const enum EInputStatus {
  /** 校验失败 */
  VerifyError,
  /** 确认失败 */
  ConfirmError,
}

const enum EPasswordLength {
  Four = 4,
  Six = 6,
}

interface IPasscodeLockProps extends NavigationComponentProps {
  type: EInputType;
  userType: EUserType;
  onClose?: () => void;
}

interface PasscodeLockOverlayComponent<T>
  extends NavigationFunctionComponent<T> {
  open: (props?: {
    type?: EInputType;
    userType?: EUserType;
    onClose?: () => void;
  }) => PVoid | undefined;
  close: () => PVoid;
}

function getTitle(type: EInputType, userType: EUserType, stage: EInputStage) {
  const t = getI18n().t;
  const fakePassText =
    userType === EUserType.GHOST &&
    stores.user.current?.type === EUserType.ADMIN
      ? t('passcodeLock:fake')
      : '';
  switch (stage) {
    case EInputStage.Confirm:
      return t('passcodeLock:confirm', { type: fakePassText });
    case EInputStage.Done:
      return type === EInputType.Verify ? '通过' : '成功';
  }

  switch (type) {
    case EInputType.Create:
      return t('passcodeLock:create', { type: fakePassText });
    case EInputType.Change:
      return t('passcodeLock:change', { type: fakePassText });
    case EInputType.Verify:
      return t('passcodeLock:verify');
  }
}

let pauseLocalAuth = false;
let isFirstOpen = true;

const PasscodeLockOverlay: PasscodeLockOverlayComponent<IPasscodeLockProps> = (
  props: IPasscodeLockProps,
) => {
  const { t } = useTranslation();
  const { global: globalStore, ui, user: userStore } = useStore();
  const [password, setPassword] = useState('');
  const [stage, setStage] = useState<EInputStage>(EInputStage.Start);
  const [inputType, setInputType] = useState<EInputType>(
    props.type ?? EInputType.Verify,
  );
  const [status, setStatus] = useState<EInputStatus>();
  const [passwordLen] = useState<EPasswordLength>(EPasswordLength.Six);
  const passcodeKeyboardRef = useRef<{
    clear: () => void;
    validateError: () => void;
  }>();
  const orientation = useDeviceOrientation();

  const title = useMemo(
    () => getTitle(inputType, props.userType, stage),
    [inputType, stage],
  );

  const appState = useAppState();

  useEffect(() => {
    if (appState === 'active' || isFirstOpen) {
      isFirstOpen = false;
      setTimeout(() => {
        if (
          inputType === EInputType.Verify &&
          globalStore.settingInfo.autoLocalAuth &&
          userStore.current?.type !== EUserType.GHOST
        ) {
          if (
            pauseLocalAuth ||
            global.appLaunchType === AppLaunchType.QuickAction
          ) {
            return;
          }
          pauseLocalAuth = true;
          handleLocalAuth();
        }
      }, 300);
    } else if (appState === 'background') {
      pauseLocalAuth = false;
      global.appLaunchType = AppLaunchType.Unknown;
    }
  }, [appState, inputType]);

  useNavigationComponentDidDisappear(() => {
    if (appState !== 'background') {
      pauseLocalAuth = true;
    }
  }, props.componentId);

  useEffect(() => {
    if (!userStore.current?.password && inputType === EInputType.Verify) {
      setInputType(EInputType.Create);
    }
  }, []);

  useUpdateEffect(() => {
    if (stage === EInputStage.Confirm) {
      visibleResetButton(true);
    } else {
      visibleResetButton(false);
    }
  }, [stage]);

  useNavigationButtonPress(handleCloseOverlay, props.componentId, 'close');
  // 重新设置密码
  useNavigationButtonPress(
    () => {
      setStage(EInputStage.Start);
      passcodeKeyboardRef.current?.clear();
    },
    props.componentId,
    'reset',
  );

  async function handleCloseOverlay() {
    await PasscodeLockOverlay.close();
    props.onClose?.();
  }

  async function handleLocalAuth() {
    if (
      globalStore.localAuthTypes?.includes(
        LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
      ) &&
      !(await PermissionManager.checkPermissions(['ios.permission.FACE_ID']))
    ) {
      return;
    }

    const user = await services.api.user.get({
      type: EUserType.ADMIN,
    });
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: t('navigator:privateSpace'),
    });

    if (result.success && user) {
      userStore.setCurrent(user);
      setTimeout(handleAuthSuccess, 200);
    }
  }

  async function handleAuthSuccess() {
    setStage(EInputStage.Done);

    globalStore.setLockScreenVisible(false);
  }

  function LocalAuthIconButton() {
    const style = {
      width: 34,
      height: 34,
      fill: ui.colors.systemBlue,
    };
    const authIcon = globalStore.localAuthTypes?.includes(
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ) ? (
      <IconTouchID {...style} fill={ui.colors.systemPink} />
    ) : (
      <IconFaceID {...style} />
    );

    return (
      <TouchableOpacity onPress={handleLocalAuth}>{authIcon}</TouchableOpacity>
    );
  }

  async function onInputDone(value: string) {
    if ([EInputType.Create, EInputType.Change].includes(inputType)) {
      // 二次确认密码
      if (stage === EInputStage.Start) {
        setStage(EInputStage.Confirm);
        setPassword(value);
        passcodeKeyboardRef.current?.clear();
        return;
      }

      // 校验密码一致性
      // 创建/修改密码
      if (stage === EInputStage.Confirm && value === password) {
        const userId =
          props.userType === EUserType.ADMIN
            ? userStore.current!.id
            : userStore.ghostUser!.id;
        try {
          await services.api.user.update({
            id: userId!,
            data: {
              password: value,
            },
          });
          if (
            inputType === EInputType.Change ||
            (inputType === EInputType.Create &&
              props.userType === EUserType.GHOST)
          ) {
            handleCloseOverlay();
          } else {
            setCurrentUserInfo(userId!);
            handleAuthSuccess();
          }
        } catch (error) {
          console.error(error);
        }
      } else {
        setStatus(EInputStatus.ConfirmError);
        passcodeKeyboardRef.current?.validateError();
      }
      // 校验密码
    } else {
      try {
        const result = await services.api.user.get({
          password: value,
        });
        if (
          result?.type === EUserType.ADMIN ||
          (result?.type === EUserType.GHOST &&
            globalStore.settingInfo.fakePassword.enabled)
        ) {
          userStore.setCurrent(result);
          handleAuthSuccess();
        } else {
          setStatus(EInputStatus.VerifyError);
          passcodeKeyboardRef.current?.validateError();
        }
      } catch (error) {}
    }
  }

  async function setCurrentUserInfo(id: string) {
    const result = await services.api.user.get({
      id,
    });
    if (result) {
      userStore.setCurrent(result);
    }
  }

  function visibleResetButton(visible: boolean) {
    let leftButtons: any[] = [];

    if (visible) {
      leftButtons = [
        {
          id: 'reset',
          text: t('passcodeLock:reset'),
        },
      ];
    }

    services.nav.screens?.N.mergeOptions(props.componentId, {
      topBar: {
        leftButtons,
      },
    });
  }

  const extraButtonEnabled =
    inputType === EInputType.Verify &&
    userStore.current?.type === EUserType.GHOST
      ? !globalStore.settingInfo.fakePassword?.hideLocalAuth
      : true;

  return (
    <View style={[styles.container]}>
      <PasscodeKeyboard
        style={[
          orientation.landscape && {
            flexDirection: 'row',
          },
        ]}
        ref={passcodeKeyboardRef}
        valueLength={passwordLen}
        onDone={onInputDone}
        header={
          <View style={styles.header}>
            <Logo />
            {typeof title === 'string' ? (
              <Text
                style={[
                  styles.tipTitle,
                  {
                    color: ui.colors.label,
                  },
                ]}>
                {title}
              </Text>
            ) : (
              title
            )}
          </View>
        }
        extraButton={extraButtonEnabled && <LocalAuthIconButton />}
      />
    </View>
  );
};

PasscodeLockOverlay.open = (
  props = {
    type: EInputType.Verify,
    userType: EUserType.ADMIN,
  },
) => {
  return services.nav.screens?.show('PasscodeLock', props, {
    animations: {
      showModal: {
        enter: {
          enabled: props.type === EInputType.Verify ? false : true,
        },
        exit: {
          enabled: true,
        },
      },
    },
  });
};

PasscodeLockOverlay.close = async () => {
  try {
    await services.nav.screens?.N.dismissModal('PasscodeLock');
  } catch {
    await services.nav.startMainScreen();
  }
};

PasscodeLockOverlay.options = props => {
  return {
    topBar:
      EInputType.Change === props.type ||
      (EInputType.Create === props.type && props.userType === EUserType.GHOST)
        ? {
            rightButtons: [
              {
                id: 'close',
                text: getI18n().t('common:close'),
                color: stores.ui.themes.primary,
              },
            ],
          }
        : {},
  };
};

function Logo() {
  const { ui } = useStore();

  const AppIcon = useMemo(() => getAppIcon(ui.appIcon), [ui.appIcon]);

  return <AppIcon style={styles.logo} width={80} height={80} />;
}

export default observer(PasscodeLockOverlay);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 25,
    height: '100%',
  },
  header: {
    alignItems: 'center',
  },
  logo: {
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  tipTitle: {
    marginTop: 36,
    fontSize: 20,
    fontWeight: '500',
  },
});
