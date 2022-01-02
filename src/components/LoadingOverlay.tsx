import React from 'react';
import {
  ActivityIndicator,
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import {
  OptionsModalTransitionStyle,
  OptionsModalPresentationStyle,
} from 'react-native-navigation';
import { VibrancyView } from '@react-native-community/blur';
import chroma from 'chroma-js';
import { merge } from 'lodash';

import { useStore } from '@/store';
import { services } from '@/services';

interface ILoadingOverlayProps {
  /**
   * @default large
   */
  size?: 'large' | 'small';
  /**
   * @default { visible: true, value: '加载中' }
   */
  text?: {
    visible?: boolean;
    value?: string;
  };
  maskClosable?: boolean;
}

interface LoadingOverlayComponent {
  isOpend: boolean;
  show: (props?: ILoadingOverlayProps) => Promise<boolean>;
  hide: () => Promise<boolean>;
}

const defaultProps = {
  maskClosable: true,
  text: {
    visible: false,
  },
};

export const LoadingOverlay: LoadingOverlayComponent =
  observer<ILoadingOverlayProps>(props => {
    const { ui } = useStore();

    return (
      <Pressable
        style={styles.container}
        onPress={() => {
          if (props.maskClosable) {
            LoadingOverlay.hide();
          }
        }}>
        <View
          style={[
            styles.indicator,
            {
              backgroundColor: chroma(ui.colors.systemBackground)
                .alpha(0.7)
                .css(),
            },
            props.text?.visible && styles.indicatorWithText,
          ]}>
          <VibrancyView
            style={StyleSheet.absoluteFill}
            blurType={
              ui.appearance === 'dark' ? 'materialDark' : 'materialLight'
            }
          />
          <ActivityIndicator
            size={props.size ?? 'large'}
            color={ui.colors.tabBar}
          />
          {props.text?.visible && (
            <Text
              style={[
                styles.indicatorText,
                {
                  color: ui.colors.label,
                },
              ]}>
              {props.text?.value ?? '加载中'}
            </Text>
          )}
        </View>
      </Pressable>
    );
  });

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  indicator: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  indicatorWithText: {
    width: 120,
    height: 120,
  },
  indicatorText: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '500',
  },
});

LoadingOverlay.isOpend = false;

LoadingOverlay.show = async (props?: ILoadingOverlayProps) => {
  if (LoadingOverlay.isOpend) {
    return false;
  }

  await services.nav.screens?.N.showModal({
    component: {
      id: 'LoadingOverlay',
      name: 'LoadingOverlay',
      options: {
        modalTransitionStyle: OptionsModalTransitionStyle.crossDissolve,
        modalPresentationStyle: OptionsModalPresentationStyle.overFullScreen,
        layout: {
          componentBackgroundColor: 'transparent',
        },
      },
      passProps: merge(defaultProps, props),
    },
  });
  LoadingOverlay.isOpend = true;

  return true;
};

LoadingOverlay.hide = async () => {
  await services.nav.screens?.N.dismissModal('LoadingOverlay');
  LoadingOverlay.isOpend = false;
  return true;
};
