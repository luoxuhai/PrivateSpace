import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewProps,
  View,
  Text,
  Alert,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import Animated from 'react-native-reanimated';
import DocumentPicker from 'react-native-document-picker';
import { SFSymbol } from 'react-native-sfsymbols';
import { useTranslation } from 'react-i18next';
import * as Toolkit from 'react-native-app-toolkit';
import Modal from 'react-native-modal';

import { LoadingOverlay } from '@/components/LoadingOverlay';
import { FileImporter } from '../PhotoList/FileImporter';
import { useStore } from '@/store';
import { services } from '@/services';
import { HapticFeedback, randomNum } from '@/utils';
import { useUIFrame } from '@/hooks';

import { transformResult } from '../PhotoList/AddButton';
import IconPlusCircleFill from '@/assets/icons/plus.circle.fill.svg';
import { useState } from 'react';
import { useCallback } from 'react';
import { useMutation, useQuery } from 'react-query';
import { UserRole } from '@/store/user';
import { Navigation } from 'react-native-navigation';

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

interface AddButtonProps extends ViewProps {
  folderId: string;
  componentId?: string;
}

enum FileImportType {
  Scan = 1,
  Document,
  Folder,
}

const ICON_PROPS = {
  size: 30,
  color: '#FFF',
};

const fileImporter = new FileImporter();

const AddButton = observer<AddButtonProps>(props => {
  const { ui, global, user, file: fileStore } = useStore();
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { bottomTabsHeight } = useUIFrame();

  const { refetch } = useQuery([props.folderId ?? 'root', '.files'], {
    enabled: false,
  });
  const createFolder = useCreateFolder(props.folderId, v => {
    refetch();
    closeModal();
    if (props.componentId) {
      Navigation.push(props.componentId, {
        component: {
          name: 'FileManager',
          passProps: {
            name: v.name,
            folderId: v.id,
          },
        },
      });
    }
  });

  const list = useMemo(
    () => [
      {
        type: FileImportType.Scan,
        icon: (
          <SFSymbol
            name="doc.viewfinder"
            color={ICON_PROPS.color}
            style={{ width: ICON_PROPS.size, height: ICON_PROPS.size }}
          />
        ),
        title: t('fileManager:add.scan'),
        color: ui.colors.systemOrange,
      },
      {
        type: FileImportType.Document,
        icon: (
          <SFSymbol
            name="folder"
            color={ICON_PROPS.color}
            style={{ width: ICON_PROPS.size, height: ICON_PROPS.size }}
          />
        ),
        title: t('fileManager:add.doc'),
        color: ui.colors.systemBlue,
      },
      {
        type: FileImportType.Folder,
        icon: (
          <SFSymbol
            name="plus.rectangle.on.folder"
            color={ICON_PROPS.color}
            style={{ width: ICON_PROPS.size, height: ICON_PROPS.size }}
          />
        ),
        title: t('fileManager:add.folder'),
        color: '#03A9F4',
      },
    ],
    [t, ui.colors],
  );

  const { mutateAsync: handleAddFile } = useMutation<void, any[], any[]>(
    async files => {
      const timer = setTimeout(() => {
        LoadingOverlay.show();
      }, 1000);
      try {
        for (const file of files) {
          await services.api.file.create(
            await transformResult(file, props.folderId),
          );
        }
      } catch {}
      clearTimeout(timer);
      LoadingOverlay.hide();
      refetch();
    },
  );

  const canOpen = useCallback(() => {
    if (user.userRole === UserRole.VIP) {
      return true;
    } else {
      services.nav.screens?.show('Purchase');
      return false;
    }
  }, [user.userRole]);

  async function handleSelectImportFile(type: FileImportType) {
    switch (type) {
      case FileImportType.Scan:
        // if (!Toolkit.isDocumentCameraSupported()) {
        //   Alert.alert(t('fileManager:add.notSupported.msg'));
        //   return;
        // }
        if (canOpen()) {
          try {
            const result = await Toolkit.openDocumentCamera();
            handleAddFile([
              {
                name: `scan-${randomNum(4)}-${Date.now()}.pdf`,
                uri: result.source,
                mime: 'application/pdf',
                metadata: {},
              },
            ]);
          } catch {
            Alert.alert(t('fileManager:add.notSupported.msg'));
          }
        }
        break;
      case FileImportType.Folder:
        createFolder();
        break;
      case FileImportType.Document:
        const result = await fileImporter
          .document({
            type: [DocumentPicker.types.allFiles],
          })
          .open();
        if (result?.length) {
          handleAddFile(result);
        }
        closeModal();
        break;
    }
  }

  function closeModal() {
    setVisible(false);
  }

  return (
    <>
      <AnimatedTouchableOpacity
        style={[
          styles.container,
          {
            shadowColor: ui.themes.primary,
            backgroundColor: ui.colors.white,
            bottom: bottomTabsHeight + 55,
          },
          props.style,
        ]}
        onPress={() => {
          setVisible(true);
          HapticFeedback.impactAsync.light();
        }}
        activeOpacity={0.8}>
        <IconPlusCircleFill width={50} height={50} fill={ui.themes.primary} />
      </AnimatedTouchableOpacity>

      <Modal
        style={styles.modal}
        backdropOpacity={0.4}
        supportedOrientations={[
          'portrait',
          'landscape',
          'portrait-upside-down',
          'landscape-left',
          'landscape-right',
        ]}
        isVisible={visible}
        hideModalContentWhileAnimating
        useNativeDriver
        onBackdropPress={closeModal}>
        <View
          style={[
            styles.bottomSheetContent,
            {
              backgroundColor:
                ui.appearance === 'dark'
                  ? ui.colors.secondarySystemBackground
                  : ui.colors.systemBackground,
            },
          ]}>
          {list.map(item => (
            <TouchableOpacity
              key={item.title}
              style={styles.item}
              onPress={async () => {
                global.setEnableMask(false);
                try {
                  await handleSelectImportFile(item.type);
                } finally {
                  global.setEnableMask(true);
                }
              }}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: item.color,
                  },
                ]}>
                {item.icon}
              </View>
              <Text
                style={[
                  styles.title,
                  {
                    color: ui.colors.label,
                  },
                ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
});

export default AddButton;

export function useCreateFolder(
  folderId?: string | null,
  onDone?: (v: any) => void,
) {
  const { t } = useTranslation();

  const handleCreateFolder = useCallback(
    async (value: string) => {
      const name = value?.trim();
      const res = await services.api.file.createFolder({
        name,
        parent_id: folderId,
      });

      if (res) {
        onDone?.({
          ...res,
          name,
        });
      }
    },
    [folderId],
  );

  return () => {
    Alert.prompt(
      t('fileManager:folderForm.title'),
      t('fileManager:folderForm.msg'),
      [
        {
          text: t('common:cancel'),
          style: 'cancel',
        },
        {
          text: t('common:confirm'),
          style: 'default',
          onPress: value => {
            if (value?.trim()) {
              handleCreateFolder(value.trim());
            }
          },
        },
      ],
      'plain-text',
    );
  };
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'red',
  },
  container: {
    position: 'absolute',
    right: 40,
    borderRadius: 25,
    shadowOffset: {
      height: 3.5,
      width: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6.5,
    width: 50,
    height: 50,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  bottomSheetContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    height: 200,
    paddingTop: 20,
    paddingHorizontal: 10,
    borderTopEndRadius: 16,
    borderTopStartRadius: 16,
  },
  item: {
    alignItems: 'center',
    minWidth: 100,
    marginBottom: 20,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 6,
  },
  title: {
    marginTop: 8,
    fontSize: 14,
  },
});
