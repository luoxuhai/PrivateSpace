import React, { useEffect, useRef } from 'react';
import {
  NavigationComponentProps,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import {
  useNavigationButtonPress,
  useNavigationComponentDidAppear,
  useNavigationSearchBarCancelPress,
  useNavigationSearchBarUpdate,
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
  ViewStyle,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { FlatGrid } from 'react-native-super-grid';

import { services, queryClient } from '@/services';
import { appUpdateCheck } from '@/utils';
import { useStore } from '@/store';
import { queryImage } from '@/screens/PhotoList';
import Icon from '@/components/Icon';
import {
  AddAlbumDialog,
  IAddAlbumDialogRef,
} from '@/components/AddAlbumDialog';
import { useCreateAlbum, useUpdateEffect } from '@/hooks';
import { DataLoadStatus } from '@/components/DataLoadStatus';
import { SearchPanel } from './SearchPanel';

const AlbumScreen: NavigationFunctionComponent<
  NavigationComponentProps
> = props => {
  const { ui, user, album } = useStore();
  const { t } = useTranslation();
  const addAlbumDialogRef = useRef<IAddAlbumDialogRef>();
  const searchPanelRef = useRef<any>(null);

  useNavigationSearchBarUpdate(e => {
    if (e.isFocused) {
      searchPanelRef.current.show();
      searchPanelRef.current.search(e.text);
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          noBorder: true,
        },
      });
    } else {
      searchPanelRef.current.hide();
      services.nav.screens?.N.mergeOptions(props.componentId, {
        topBar: {
          noBorder: false,
        },
      });
    }
  }, props.componentId);

  useNavigationSearchBarCancelPress(() => {
    searchPanelRef.current.hide();
  }, props.componentId);

  const {
    isLoading,
    data: albumData,
    refetch: refetchAlbumList,
  } = useQuery(
    'albums',
    async () => {
      const res = await services.api.album.list({
        owner: user.current?.id,
      });

      return {
        items: res.items ?? [],
        total: res.total ?? 0,
      };
    },
    {
      enabled: false,
    },
  );

  const { mutateAsync: createAlbum } = useCreateAlbum();

  useEffect(() => {
    refetchAlbumList();
  }, [user.current?.id, album.refetchAlbum]);

  useUpdateEffect(() => {
    services.nav.startMainScreen();
  }, [user.current?.id]);

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
        style={{
          backgroundColor: ui.colors.systemBackground,
        }}
        ListEmptyComponent={
          <DataLoadStatus loading={isLoading} text={t('album:noData')} />
        }
        windowSize={5}
        itemDimension={150}
        spacing={20}
        data={albumData?.items ?? []}
        renderItem={({ item }) => (
          <AlbumCard
            data={item}
            onPressIn={() => {
              queryClient.prefetchQuery([item.id, '.photos'], () =>
                queryImage(item.id, album),
              );
            }}
            onPress={() => {
              services.nav.screens?.push(
                props.componentId,
                'ImageList',
                {
                  albumName: item.name,
                  albumId: item.id,
                  hasImage: !!item.item_total,
                  count: {
                    image: item.image_total,
                    video: item.video_total,
                  },
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
      <SearchPanel ref={searchPanelRef} componentId={props.componentId} />
    </>
  );
};

export default observer(AlbumScreen);

interface IAlbumCardProps {
  componentId?: string;
  data: API.AlbumWithSource;
  style?: ViewStyle;
  footerStyle?: ViewStyle;
  onPress?: () => void;
  onPressIn?: () => void;
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
        props.style,
      ]}
      onPressIn={props.onPressIn}
      onPress={props.onPress}>
      <FastImage
        style={albumCardStyles.image}
        source={{
          uri: props.data.cover,
        }}
      />
      <View style={[albumCardStyles.footer, props.footerStyle]}>
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
              {props.data.item_total}
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
