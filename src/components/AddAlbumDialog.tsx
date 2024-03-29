import React, {
  useState,
  useImperativeHandle,
  useCallback,
  useRef,
  forwardRef,
} from 'react';
import Modal from 'react-native-modal';
import { View, TextInput, Text, StyleSheet, Alert } from 'react-native';
import { observer } from 'mobx-react-lite';
import { VibrancyView } from '@react-native-community/blur';
import chroma from 'chroma-js';
import { useTranslation } from 'react-i18next';

import { useStore } from '@/store';
import config from '@/config';
import CustomButton from './CustomButton';
import { IconButton } from './Icon';

interface IAddAlbumDialogProps {
  defaultValue?: string;
  onDone?: (value: string) => void;
}

export interface IAddAlbumDialogRef {
  open: () => void;
  close: () => void;
}

export const AddAlbumDialog = observer<
  IAddAlbumDialogProps,
  IAddAlbumDialogRef
>(
  forwardRef((props, ref) => {
    const [visible, setVisible] = useState<boolean>(false);
    const textInputRef = useRef<TextInput>(null);
    const inputValueRef = useRef<string>();
    const { ui, global } = useStore();
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
      open(): void {
        inputValueRef.current = props.defaultValue;
        setVisible(true);
      },
      close() {
        closeDialog();
      },
    }));

    function closeDialog() {
      setVisible(false);
      inputValueRef.current = undefined;
    }

    const Header = useCallback(
      () => (
        <View style={styles.header}>
          <View style={styles.headerTitle}>
            <Text
              style={[
                styles.title,
                {
                  color: ui.colors.label,
                },
              ]}>
              {t('createAlbum:dialog.title')}
            </Text>
            <Text
              style={[
                styles.message,
                {
                  color: ui.colors.secondaryLabel,
                },
              ]}>
              {t('createAlbum:dialog.subtitle')}
            </Text>
          </View>
          <IconButton
            containerStyle={[
              styles.closeIcon,
              {
                backgroundColor: ui.colors.secondaryFill,
              },
            ]}
            color={ui.colors.secondaryLabel}
            name="ios-close"
            size={20}
            onPress={closeDialog}
          />
        </View>
      ),
      [ui],
    );

    const isDark = ui.appearance === 'dark';

    return (
      <Modal
        backdropOpacity={0.4}
        supportedOrientations={[
          'portrait',
          'landscape',
          'portrait-upside-down',
          'landscape-left',
          'landscape-right',
        ]}
        isVisible={visible}
        avoidKeyboard
        style={styles.modal}
        hideModalContentWhileAnimating
        useNativeDriver
        onModalWillHide={() => {
          setTimeout(() => {
            textInputRef.current?.blur?.();
          }, 20);
        }}
        onModalWillShow={() => {
          setTimeout(() => {
            textInputRef.current?.focus?.();
          }, 20);
        }}
        onBackdropPress={closeDialog}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: chroma(
                isDark
                  ? ui.colors.secondarySystemBackground
                  : ui.colors.systemBackground,
              )
                .alpha(isDark ? 0.5 : 0.7)
                .css(),
            },
          ]}>
          <VibrancyView
            style={StyleSheet.absoluteFill}
            blurType={isDark ? 'materialDark' : 'materialLight'}
          />
          <Header />
          <TextInput
            ref={textInputRef}
            style={[
              styles.input,
              {
                backgroundColor: ui.colors.secondaryFill,
                color: ui.colors.label,
              },
            ]}
            enablesReturnKeyAutomatically
            maxLength={200}
            keyboardAppearance={isDark ? 'dark' : 'light'}
            returnKeyType="done"
            placeholder={t('createAlbum:dialog.albumName')}
            selectionColor={ui.themes.primary}
            onChangeText={value => {
              inputValueRef.current = value.trim();
            }}
          />
          <View style={styles.footer}>
            <CustomButton
              style={styles.button}
              color={ui.themes.primary}
              onPress={() => {
                if (inputValueRef.current === config.enableDebugModeKey) {
                  global.setDebug(!global.debug);
                  closeDialog();
                  setTimeout(() => {
                    Alert.alert(
                      global.debug ? '已开启开发者模式' : '已关闭开发者模式',
                    );
                  }, 200);
                  return;
                }
                if (inputValueRef.current?.length) {
                  props.onDone?.(inputValueRef.current);
                  closeDialog();
                }
              }}>
              {t('common:confirm')}
            </CustomButton>
          </View>
        </View>
      </Modal>
    );
  }),
);

const styles = StyleSheet.create({
  modal: {
    alignItems: 'center',
  },
  container: {
    width: 300,
    borderRadius: 12,
    paddingVertical: 22,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
  },
  closeIcon: {
    position: 'absolute',
    top: -12,
    right: 8,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
  },
  title: {
    textAlign: 'center',
    fontSize: 17,
    fontWeight: '500',
  },
  message: {
    marginTop: 5,
    textAlign: 'center',
  },
  input: {
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  button: {
    width: '60%',
    height: 36,
  },
});
