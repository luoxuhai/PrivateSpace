import React from 'react';
import { TextInput, Image, StyleSheet, View } from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { useMutation, useQuery } from 'react-query';
import { useTranslation } from 'react-i18next';

import { debounce } from 'lodash';
import { services } from '@/services';
import { useStore } from '@/store';
import { HapticFeedback, showDeleteActionSheet } from '@/utils';
import { UIStore } from '@/store/ui';
import CustomButton from '@/components/CustomButton';
import SafeAreaScrollView from '@/components/SafeAreaScrollView';
import List from '@/components/List';

interface IAlbumSettingModalProps extends NavigationComponentProps {
  album: API.AlbumWithSource;
  onComplete: () => void;
}

const AlbumSettingModal: NavigationFunctionComponent<
  IAlbumSettingModalProps
> = props => {
  const { ui, global } = useStore();
  const { t } = useTranslation();
  const { refetch: refetchAlbumList, data: albumResult } = useQuery('albums', {
    enabled: false,
  });

  const { mutate: updateAlbum } = useMutation<void, unknown, { name: string }>(
    async data => {
      try {
        await services.api.album.update({
          where: {
            id: props.album.id,
          },
          data,
        });
        refetchAlbumList();
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  const { mutate: handleDeleteAlbum } = useMutation<void, unknown, string>(
    async id => {
      try {
        await (global.settingInfo.recycleBin.enabled
          ? services.api.album.softDelete
          : services.api.album.delete)({
          id,
        });
        refetchAlbumList();
        handleDismissModal();
      } catch (error) {
        console.error('error', error);
      }
    },
  );

  useNavigationButtonPress(handleDismissModal, props.componentId, 'dismiss');

  function handleDismissModal() {
    services.nav.screens?.N.dismissModal(props.componentId);
  }

  return (
    <SafeAreaScrollView
      contentContainerStyle={styles.contentContainer}
      style={[
        styles.container,
        {
          backgroundColor: ui.colors.secondarySystemBackground,
        },
      ]}>
      <View style={styles.content}>
        <OperationList
          ui={ui}
          album={
            albumResult?.items.find(item => item.id === props.album.id) ??
            props.album
          }
          onChange={debounce(data => {
            updateAlbum(data);
          }, 400)}
        />
        <CustomButton
          style={StyleSheet.flatten(styles.deleteBtn)}
          color={ui.colors.systemRed}
          onPress={() => {
            showDeleteActionSheet({
              title: t('albumSetting:deleteActionSheet.title'),
              onConfirm: () => {
                handleDeleteAlbum(props.album.id as string);
              },
            });
            HapticFeedback.impactAsync.medium();
          }}>
          {t('common:delete')}
        </CustomButton>
      </View>
    </SafeAreaScrollView>
  );
};

export default observer(AlbumSettingModal);

interface IOperationListProps {
  ui: UIStore;
  album: API.AlbumWithSource;
  onPress?: () => void;
  onChange?: (data: { name?: string }) => void;
}

function OperationList({
  ui,
  album,
  onChange,
}: IOperationListProps): JSX.Element {
  const { t } = useTranslation();

  const list = [
    {
      title: t('albumSetting:albumName'),
      render: () => (
        <TextInput
          style={[
            styles.input,
            {
              color: ui.colors.secondaryLabel,
              backgroundColor: ui.colors.secondarySystemBackground,
            },
          ]}
          defaultValue={album.name}
          placeholder={t('albumSetting:placeholder')}
          placeholderTextColor={ui.colors.tertiaryLabel}
          maxLength={200}
          selectTextOnFocus
          enablesReturnKeyAutomatically
          keyboardAppearance={ui.appearance === 'dark' ? 'dark' : 'light'}
          returnKeyType="done"
          selectionColor={ui.themes.primary}
          onChangeText={value => {
            onChange?.({
              name: value,
            });
          }}
        />
      ),
    },
    {
      title: t('albumSetting:cover'),
      render: () => (
        <Image
          style={styles.image}
          source={{
            uri: album.cover,
          }}
        />
      ),
      onPress: () => {
        services.nav.screens?.show('AlbumCover', {
          album,
        });
      },
    },
  ];

  return (
    <List
      style={[
        ui.appearance === 'dark' && {
          backgroundColor: ui.colors.tertiarySystemGroupedBackground,
        },
      ]}
      data={list}
    />
  );
}

const styles = StyleSheet.create({
  container: {},
  contentContainer: {
    alignItems: 'stretch',
  },
  content: {
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%',
  },
  image: {
    width: 36,
    height: 36,
    borderRadius: 4,
  },
  input: {
    minWidth: '65%',
    height: 34,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  deleteBtn: {
    marginTop: 100,
    width: 300,
  },
});
