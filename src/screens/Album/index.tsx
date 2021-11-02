import React, { useEffect, useRef } from 'react';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidAppear,
} from 'react-native-navigation-hooks';
import { VibrancyView } from '@react-native-community/blur';
import FastImage from 'react-native-fast-image';
import { useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import {
  View,
  Pressable,
  Text,
  StyleSheet,
  LayoutAnimation,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';

import { services } from '@/services';
import { IListAlbumData } from '@/services/api/local/type.d';
import { appUpdateCheck } from '@/utils';
import { useStore } from '@/store';
import Icon from '@/components/Icon';
import {
  AddAlbumDialog,
  IAddAlbumDialogRef,
} from '@/components/AddAlbumDialog';
import { useCreateAlbum } from '@/hooks';
import { DataLoadStatus } from '@/components/DataLoadStatus';

const AlbumScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const { ui, user, album, global } = useStore();
  const { t } = useTranslation();
  const addAlbumDialogRef = useRef<IAddAlbumDialogRef>();

  const {
    isLoading,
    data: albumList,
    refetch: refetchAlbumList,
  } = useQuery(
    'list.album',
    async () => {
      return await services.api.local
        .listAlbum({
          owner: user.userInfo!.id,
        })
        .then(res => res.data);
    },
    {
      enabled: false,
    },
  );

  const { mutateAsync: createAlbum } = useCreateAlbum();

  useEffect(() => {
    refetchAlbumList();
  }, [user.userInfo?.id, album.refetchAlbum]);

  useEffect(() => {
    setTimeout(() => {
      appUpdateCheck();
    }, 2000);
  }, []);

  useNavigationComponentDidAppear(() => {
    refetchAlbumList();
  }, props.componentId);

  // 新建相册
  useNavigationButtonPress(
    () => {
      addAlbumDialogRef.current?.open();
    },
    props.componentId,
    'add',
  );

  return (
    <>
      <FlatGrid
        refreshing={isLoading}
        onRefresh={refetchAlbumList}
        style={{
          backgroundColor: ui.colors.systemBackground,
        }}
        ListEmptyComponent={
          <DataLoadStatus loading={isLoading} text={t('album:noData')} />
        }
        itemDimension={150}
        spacing={20}
        data={albumList?.list ?? []}
        renderItem={({ item }) => (
          <AlbumCard
            data={item}
            onPress={() => {
              services.nav.screens?.push(
                props.componentId,
                'ImageList',
                {
                  albumName: item.name,
                  albumId: item.id,
                  hasImage: !!item.file_count,
                },
                {
                  bottomTabs: {
                    visible: false,
                  },
                },
              );
            }}
            extraButton={
              <Pressable
                hitSlop={10}
                onPress={() => {
                  services.nav.screens?.show('AlbumSetting', {
                    album: item,
                  });
                }}>
                <Icon
                  style={[
                    albumCardStyles.iconMore,
                    {
                      color: ui.colors.label,
                    },
                  ]}
                  name="ios-ellipsis-vertical"
                />
              </Pressable>
            }
            {...props}
          />
        )}
      />
      <AddAlbumDialog
        ref={addAlbumDialogRef}
        onDone={async name => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          await createAlbum({
            name,
          });
          refetchAlbumList();
        }}
      />
    </>
  );
};

export default observer(AlbumScreen);

interface IAlbumCardProps {
  componentId: string;
  data: IListAlbumData;
  onPress?: () => void;
  extraButton?: JSX.Element;
}

export function AlbumCard(props: IAlbumCardProps) {
  const { ui } = useStore();

  return (
    <Pressable
      style={[
        albumCardStyles.item,
        {
          backgroundColor: ui.colors.secondaryFill,
          borderColor: ui.colors.systemGray6,
        },
      ]}
      onPress={props.onPress}>
      <FastImage
        style={albumCardStyles.image}
        source={{
          uri: props.data.cover,
        }}
      />
      <View style={albumCardStyles.footer}>
        <VibrancyView
          style={albumCardStyles.blurView}
          blurType={ui.appearance === 'dark' ? 'materialDark' : 'materialLight'}
        />
        <View style={albumCardStyles.descContainer}>
          <View style={albumCardStyles.textContainer}>
            <Text
              style={[
                albumCardStyles.name,
                {
                  color: ui.colors.label,
                },
              ]}
              numberOfLines={1}>
              {props.data.name}
            </Text>
            <Text
              style={[
                albumCardStyles.count,
                {
                  color: ui.colors.secondaryLabel,
                },
              ]}>
              {props.data.file_count}
            </Text>
          </View>
          {props.extraButton}
        </View>
      </View>
    </Pressable>
  );
}

const albumCardStyles = StyleSheet.create({
  item: {
    height: 200,
    borderRadius: 4,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: {
    flex: 1,
  },
  iconMore: {
    fontSize: 18,
  },
  footer: {
    ...StyleSheet.absoluteFillObject,
    top: 'auto',
    height: 50,
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
  },
  descContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    marginBottom: 2,
  },
  count: {
    fontSize: 12,
  },
});