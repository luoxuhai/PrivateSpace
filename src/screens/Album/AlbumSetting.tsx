import React from 'react';
import { TextInput, Image, StyleSheet, View } from 'react-native';
import {
  NavigationFunctionComponent,
  NavigationComponentProps,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { useMutation, useQuery } from 'react-query';

import { debounce } from 'lodash';
import { services } from '@/services';
import { IListAlbumData } from '@/services/api/local/type.d';
import { useStore } from '@/store';
import { HapticFeedback, showDeleteActionSheet } from '@/utils';
import { UIStore } from '@/store/ui';
import CustomButton from '@/components/CustomButton';
import SafeAreaScrollView from '@/components/SafeAreaScrollView';
import List from '@/components/List';

interface IAlbumSettingModalProps extends NavigationComponentProps {
  album: IListAlbumData;
  onComplete: () => void;
}

const AlbumSettingModal: NavigationFunctionComponent<
  IAlbumSettingModalProps
> = props => {
  const { ui, global } = useStore();

  const { refetch: refetchAlbumList, data: albumResult } = useQuery(
    'list.album',
    {
      enabled: false,
    },
  );

  const { mutate: updateAlbum } = useMutation<void, unknown, { name: string }>(
    async data => {
      try {
        await services.api.local.updateFile({
          id: props.album.id!,
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
        await services.api.local.deleteAlbum({
          ids: [id],
          isMark: global.settingInfo.recycleBin.enabled,
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
            albumResult?.list.find(item => item.id === props.album.id) ??
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
              title: '删除相册',
              onConfirm: () => {
                handleDeleteAlbum(props.album.id!);
              },
            });
            HapticFeedback.impactAsync.medium();
          }}>
          删除
        </CustomButton>
      </View>
    </SafeAreaScrollView>
  );
};

export default observer(AlbumSettingModal);

interface IOperationListProps {
  ui: UIStore;
  album: IListAlbumData;
  onPress?: () => void;
  onChange?: (data: { name?: string }) => void;
}

function OperationList({
  ui,
  album,
  onChange,
}: IOperationListProps): JSX.Element {
  const list = [
    {
      title: '相册名称',
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
          placeholder="请输入相册名称"
          placeholderTextColor={ui.colors.tertiaryLabel}
          maxLength={200}
          selectTextOnFocus
          enablesReturnKeyAutomatically
          keyboardAppearance={ui.appearance === 'dark' ? 'dark' : 'light'}
          returnKeyType="done"
          onChangeText={value => {
            onChange?.({
              name: value,
            });
          }}
        />
      ),
    },
    {
      title: '相册封面',
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
    width: '75%',
    height: 34,
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  deleteBtn: {
    marginTop: 100,
    width: 300,
  },
});