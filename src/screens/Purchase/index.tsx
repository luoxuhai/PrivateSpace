import React, { useMemo, useCallback, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Linking,
  TouchableOpacity,
} from 'react-native';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { observer } from 'mobx-react-lite';
import { useTranslation, getI18n } from 'react-i18next';
import { useQuery } from 'react-query';
import { InAppBrowser } from 'react-native-inappbrowser-reborn';
import chroma from 'chroma-js';
import * as InAppPurchases from 'expo-in-app-purchases';
import { Placeholder, PlaceholderLine, Fade } from 'rn-placeholder';
import { SFSymbol } from 'react-native-sfsymbols';
import { RNToasty } from 'react-native-toasty';

import { CustomSentry } from '@/utils/customSentry';
import { stores, useStore } from '@/store';
import { UIStore } from '@/store/ui';
import { services } from '@/services';
import { ScreenName } from '@/screens';
import config, { BOTTOM_TABS_HEIGHT } from '@/config';
import { HapticFeedback, applicationInfo } from '@/utils';
import { SafeAreaScrollView } from '@/components';
import { Toolbar } from '@/components/Toolbar';
import CustomButton from '@/components/CustomButton';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { UserRole } from '@/store/user';

import IconMore from '@/assets/icons/ellipsis.circle.svg';
import IconSearch from '@/assets/icons/vip.search.svg';
import IconTrash from '@/assets/icons/vip.trash.svg';
import IconWifi from '@/assets/icons/vip.wifi.2.svg';
import IconiCloud from '@/assets/icons/vip.icloud.svg';
import { useUIFrame } from '@/hooks';

const PAY_BUTTON_WIDTH = 250;
const ICON_COLOR = '#EED198';
let inAppPurchaseConnected = false;

const enum ToolbarListKey {
  USER_AGREEMENT,
  PRIVACY_POLICY_URL,
}

const t = getI18n().t;

const isDark = (ui: UIStore) => ui.appearance === 'dark';

// 全局设置购买侦听器
setPurchaseListener();

function handleDismiss() {
  services.nav.screens?.dismissModal('Purchase');
}

const PurchaseScreen: NavigationFunctionComponent =
  observer<NavigationComponentProps>(props => {
    const { ui, user, global } = useStore();
    const { t, i18n } = useTranslation();
    const webLanguageKey = useMemo(
      () => (i18n.language === 'zh-CN' ? 'zh_cn' : 'en_us'),
      [i18n.language],
    );
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const bottomTabsHeight =
      services.nav.screens?.getConstants().bottomTabsHeight ?? 44;
    const [projectList, setProjectList] = useState<any[]>([
      // {
      //   title: '连续包年',
      //   productId: config.inAppPurchasesProductIds[0],
      // },
      {
        title: t('purchase:product.title'),
        subTitle: t('purchase:product.subTitle'),
        productId: config.inAppPurchasesProductIds[1],
      },
    ]);
    const [currentProject, setCurrentProject] = useState(projectList[0]);
    const payButtonDisplayMap = useMemo(
      () => ({
        // [config
        //   .inAppPurchasesProductIds[0]]: `订阅-${projectList[0].price}每年`,
        [config.inAppPurchasesProductIds[1]]: t('purchase:payButton.title', {
          price: projectList[0].price,
        }),
      }),
      [projectList],
    );

    const toolbarList = [
      {
        key: ToolbarListKey.USER_AGREEMENT,
        title: t('about:agreement'),
      },
      {
        key: ToolbarListKey.PRIVACY_POLICY_URL,
        title: t('about:private'),
      },
    ];

    useNavigationButtonPress(handleDismiss, props.componentId, 'cancel');
    useNavigationButtonPress(
      handleRestorePurchasePress,
      props.componentId,
      'restore',
    );

    useEffect(() => {
      global.setEnableMask(false);
      return () => {
        global.setEnableMask(true);
        disconnectAsync();
      };
    }, []);

    const { isLoading, isSuccess } = useQuery(
      'in.app.purchase',
      async () => {
        if (!inAppPurchaseConnected) {
          await connectInAppPurchaseAsync();
        }
        await setProducts();
      },
      { enabled: true },
    );

    const handleOpenBrowserPress = useCallback(
      (key: string | number) => {
        let url;
        switch (key) {
          case ToolbarListKey.USER_AGREEMENT:
            url = `${config.USER_AGREEMENT[webLanguageKey]}`;
            break;
          case ToolbarListKey.PRIVACY_POLICY_URL:
            url = `${config.PRIVACY_POLICY_URL[webLanguageKey]}`;
            break;
          default:
            return;
        }

        InAppBrowser.open(url, {
          dismissButtonStyle: 'close',
          preferredControlTintColor: ui.themes.primary,
          animated: true,
          enableBarCollapsing: true,
        });
      },
      [ui.themes.primary],
    );

    async function setProducts() {
      const { results, responseCode } = await InAppPurchases.getProductsAsync(
        config.inAppPurchasesProductIds,
      );
      products = results;
      if (responseCode !== InAppPurchases.IAPResponseCode.OK) return;

      setProjectList([
        // {
        //   title: '连续包年',
        //   price: results?.find(
        //     item => item.productId === config.inAppPurchasesProductIds[0],
        //   )?.price,
        //   productId: config.inAppPurchasesProductIds[0],
        // },
        {
          ...projectList[0],
          price: results?.find(
            item => item.productId === config.inAppPurchasesProductIds[1],
          )?.price,
        },
      ]);
    }

    // 恢复购买
    async function handleRestorePurchasePress() {
      if (!inAppPurchaseConnected) return;

      LoadingOverlay.show({
        text: {
          visible: true,
          value: t('purchase:recovering'),
        },
      });
      const result = await InAppPurchases.getPurchaseHistoryAsync();
      try {
        await LoadingOverlay.hide();
      } catch {}
      if (
        result?.results?.find(item =>
          config.inAppPurchasesProductIds.includes(item.productId),
        )
      ) {
        user.setPurchaseResults(result?.results);
        stores.global.setSettingInfo({
          advanced: {
            smartSearch: {
              enabled: true,
            },
          },
        });
        handleDismiss();
      } else {
        user.setPurchaseResults([]);
        Alert.alert(
          t('purchase:purchaseState.restoreFail.title'),
          t('purchase:purchaseState.restoreFail.detail'),
        );
      }
    }

    // 购买
    async function handlePayPress() {
      if (!currentProject.productId) return;
      HapticFeedback.impactAsync.heavy();

      setPurchaseLoading(true);
      if (!inAppPurchaseConnected) {
        await connectInAppPurchaseAsync();
      }

      LoadingOverlay.show({
        text: {
          visible: true,
          value: t('purchase:paying'),
        },
      });
      await InAppPurchases.purchaseItemAsync(currentProject.productId);
      setPurchaseLoading(false);
      LoadingOverlay.hide();
    }

    const isPerpetual = useMemo(
      () =>
        !!user.purchaseResults?.find(
          res => res.productId === config.inAppPurchasesProductIds[1],
        ),
      [user.purchaseResults],
    );

    return (
      <>
        <SafeAreaScrollView
          style={[
            styles.scrollView,
            {
              backgroundColor: ui.colors.systemBackground,
            },
          ]}
          contentContainerStyle={{
            paddingBottom: bottomTabsHeight,
          }}>
          <LargeTitle text={t('purchase:price')} />
          <Project
            value={currentProject}
            list={projectList}
            onChange={item => setCurrentProject(item)}
          />
          <LargeTitle text={t('purchase:privilege')} />
          <Rights componentId={props.componentId} />
          <Agreement />
        </SafeAreaScrollView>

        {!isLoading && isSuccess && (
          <PayButton
            text={
              user.purchaseResults?.find(
                res => res.productId === currentProject.productId,
              ) || isPerpetual
                ? currentProject.productId ===
                  config.inAppPurchasesProductIds[1]
                  ? t('purchase:purchased')
                  : t('purchase:subscribed')
                : payButtonDisplayMap[currentProject.productId]
            }
            loading={purchaseLoading}
            disabled={
              isLoading ||
              !isSuccess ||
              !!user.purchaseResults?.find(
                res => res.productId === currentProject.productId,
              ) ||
              isPerpetual
            }
            onPress={handlePayPress}
          />
        )}

        <Toolbar visible list={toolbarList} onPress={handleOpenBrowserPress} />
      </>
    );
  });

const Agreement = observer(() => {
  const { ui } = useStore();

  function openEmail() {
    Linking.openURL(`mailto:${config.email}`);
  }

  const textStyle = {
    color: ui.colors.secondaryLabel,
  };

  return (
    <View style={styles.tipContainer}>
      {/* <Text style={[styles.tipText, textStyle]}>
        确认订阅：用户确认购买并付款后将记入 Apple 账户。
      </Text>
      <Text style={[styles.tipText, textStyle]}>
        取消续订：如需取消续订，请在当前订阅周期到期前24小时以前，手动在 Apple
        ID 设置管理中关闭自动续费功能，到期前24小时内取消，将会收取订阅费用。
      </Text> */}
      <View>
        <Text style={[styles.tipText, textStyle]}>
          {/* 自动续费：确认订阅后将向您的 Apple
          账户收取费用，订阅以年为计费周期。订阅服务将会在当前周期结束时自动续订并收取费用，取消自动续订需要在当前订阅周期结束24小时
          前完成。在任何时候，您都可以在 App Store 进行订阅管理
          。 */}
          {t('purchase:declare')}
          <Pressable onPress={openEmail}>
            <Text
              style={[
                {
                  color: ui.colors.systemBlue,
                  top: 3,
                  left: 4,
                },
              ]}>
              {t('purchase:contact')}
            </Text>
          </Pressable>
        </Text>
      </View>
    </View>
  );
});

const Project = observer(
  ({
    value,
    list,
    onChange,
  }: {
    value: any;
    list: any[];
    onChange: (item: any) => void;
  }) => {
    const { ui } = useStore();

    const projectItemCheckedStyle = {
      borderColor: ui.colors.systemOrange,
      backgroundColor: chroma(ui.colors.systemOrange).alpha(0.15).css(),
    };

    return (
      <View style={styles.projectWrapper}>
        {list?.map((item, index) => (
          <Pressable
            key={item.title}
            style={[
              styles.projectItem,
              {
                backgroundColor: isDark(ui)
                  ? ui.colors.secondarySystemBackground
                  : ui.colors.systemBackground,
              },
              index !== 0 && {
                marginLeft: '8%',
              },
              value.productId === item.productId && projectItemCheckedStyle,
            ]}
            onPress={() => {
              onChange?.(item);
            }}>
            <View>
              <Text
                style={[
                  {
                    color: ui.colors.label,
                  },
                ]}>
                {item.title}
              </Text>
              <Text
                style={[
                  styles.projectItemSubTitle,
                  {
                    color: ui.colors.secondaryLabel,
                  },
                ]}>
                {item.subTitle}
              </Text>
            </View>

            {item.price ? (
              <Text
                style={[
                  styles.projectItemPrice,
                  {
                    color: ui.colors.label,
                  },
                ]}>
                {item.price}
              </Text>
            ) : (
              <Placeholder
                style={{
                  marginTop: 10,
                }}
                Animation={Fade}>
                <PlaceholderLine
                  width={50}
                  height={20}
                  style={{
                    backgroundColor: ui.colors.secondarySystemBackground,
                    borderRadius: 2,
                  }}
                />
              </Placeholder>
            )}
          </Pressable>
        ))}
      </View>
    );
  },
);

const Rights = ({ componentId }: { componentId: string }) => {
  const { user } = useStore();
  const { t } = useTranslation();

  const rightsList = useMemo(
    () => [
      {
        image: IconWifi,
        title: t('purchase:rights.wifi.title'),
        screenId: 'Transfer',
      },
      {
        title: t('purchase:rights.appIcon.title'),
        screenId: 'ThemeSetting',
        symbol: (
          <SFSymbol
            name="app.badge"
            color={ICON_COLOR}
            weight="medium"
            size={25}
          />
        ),
      },
      {
        symbol: (
          <SFSymbol
            name="doc.viewfinder"
            color={ICON_COLOR}
            weight="medium"
            size={25}
          />
        ),
        title: t('purchase:rights.scan.title'),
        screenId: 'FileManager',
      },
      {
        image: IconSearch,
        title: t('purchase:rights.search.title'),
        screenId: 'AdvancedSetting',
      },
      {
        image: IconTrash,
        title: t('purchase:rights.trash.title'),
        screenId: 'RecycleBinSetting',
      },
      {
        image: IconMore,
        title: t('purchase:rights.more.title'),
      },
    ],
    [t],
  );

  const handlePress = useCallback(
    screenId => {
      if (user.userRole === UserRole.VIP) {
        if (screenId) {
          services.nav.screens?.push(componentId, screenId as ScreenName);
        }
      } else {
        RNToasty.Show({
          title: t('purchase:unpayTip'),
          position: 'top',
        });
      }
    },
    [componentId],
  );

  return (
    <View style={styles.rightsWrapper}>
      {rightsList.map(item => (
        <TouchableOpacity
          key={item.title}
          activeOpacity={item.screenId ? 0.5 : 1}
          style={[
            styles.rightsItem,
            {
              width: '25%',
            },
          ]}
          onPress={() => handlePress(item.screenId)}>
          <View style={styles.rightsIcon}>
            {item.image ? (
              <item.image
                width={25}
                height={25}
                fill={ICON_COLOR}
                style={styles.rightsItemImg}
              />
            ) : (
              item.symbol
            )}
          </View>
          <Text numberOfLines={2} style={styles.rightsItemTitle}>
            {item.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const LargeTitle = ({ text }: { text: string }) => {
  const { ui } = useStore();

  return (
    <Text
      style={[
        styles.largeTitle,
        {
          color: ui.colors.label,
        },
      ]}>
      {text}
    </Text>
  );
};

const PayButton = ({
  text,
  loading,
  disabled,
  onPress,
}: {
  text: string;
  loading: boolean;
  disabled: boolean;
  onPress: () => void;
}) => {
  const { ui } = useStore();
  const { bottomTabsHeight } = useUIFrame();

  return (
    <CustomButton
      style={[
        styles.payButton,
        {
          transform: [
            {
              translateX: -PAY_BUTTON_WIDTH / 2,
            },
          ],
          bottom: (bottomTabsHeight || BOTTOM_TABS_HEIGHT) + 26,
        },
      ]}
      color={ui.themes.primary}
      loading={loading}
      disabled={disabled}
      onPress={onPress}>
      {text}
    </CustomButton>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  tipContainer: {
    paddingHorizontal: 16,
    marginTop: 30,
    marginBottom: 60,
  },
  tipText: {
    marginBottom: 4,
    fontSize: 13,
  },
  projectItemSubTitle: {
    marginTop: 4,
    fontSize: 12,
  },
  projectItemPrice: {
    fontWeight: '500',
    fontSize: 17,
  },
  rightsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 10,
    flexWrap: 'wrap',
  },
  rightsItem: {
    height: 100,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 5,
    marginBottom: 10,
  },
  rightsItemImg: {
    overflow: 'hidden',
  },
  rightsIcon: {
    width: 50,
    height: 50,
    marginBottom: 12,
    backgroundColor: '#FCF6E9',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  rightsItemTitle: {
    flex: 1,
    color: '#A7853E',
    fontSize: 12,
    textAlign: 'center',
    flexWrap: 'wrap',
  },
  projectWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 20,
    marginTop: 10,
  },
  projectItem: {
    flex: 1,
    height: 90,
    borderWidth: 2,
    borderColor: 'transparent',
    borderRadius: 4,
    padding: 10,
    justifyContent: 'space-between',
  },

  largeTitle: {
    fontWeight: '500',
    fontSize: 20,
    marginVertical: 10,
    marginHorizontal: 16,
  },
  payButton: {
    position: 'absolute',
    width: PAY_BUTTON_WIDTH,
    left: '50%',
  },
});

export default PurchaseScreen;

// 连接到应用商店
async function connectInAppPurchaseAsync() {
  await InAppPurchases.connectAsync();
  inAppPurchaseConnected = true;
}

async function disconnectAsync() {
  await InAppPurchases.disconnectAsync();
  inAppPurchaseConnected = false;
}

function setPurchaseListener() {
  InAppPurchases.setPurchaseListener(
    async ({ responseCode, results, errorCode }) => {
      switch (responseCode) {
        case InAppPurchases.IAPResponseCode.OK:
          if (results) {
            for (const purchase of results) {
              if (!purchase.acknowledged) {
                await InAppPurchases.finishTransactionAsync(purchase, true);
              }
            }
            stores.user.setPurchaseResults(results);
            stores.global.setSettingInfo({
              advanced: {
                smartSearch: {
                  enabled: true,
                },
              },
            });
            try {
              await LoadingOverlay.hide();
              if (applicationInfo.env === 'AppStore') {
                services.api.purchase.pay({
                  app: '隐私空间',
                  price: 25 * 0.85,
                });
              }
            } catch {}
            handleDismiss();
          }
          break;
        case InAppPurchases.IAPResponseCode.USER_CANCELED:
          Alert.alert(
            t('purchase:purchaseState.fail.title'),
            t('purchase:purchaseState.fail.canceled'),
          );
          break;
        case InAppPurchases.IAPResponseCode.DEFERRED:
          Alert.alert(
            t('purchase:purchaseState.fail.title'),
            t('purchase:purchaseState.fail.deferred'),
          );
          break;
        default:
          CustomSentry.captureException(
            new Error(`购买失败,错误代码：${errorCode}`),
          );
          Alert.alert(
            t('purchase:purchaseState.fail.title'),
            `${t('purchase:purchaseState.fail.errorCode')}${errorCode}`,
          );
      }
    },
  );
}
