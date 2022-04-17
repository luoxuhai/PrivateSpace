import React from 'react';
import {
  Navigation,
  NavigationFunctionComponent,
} from 'react-native-navigation';
import { observer } from 'mobx-react-lite';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';
import { useQuery } from 'react-query';
import { StyleSheet, View } from 'react-native';
import FileList from '../FileManager/components/FileList';
import { services } from '@/services';
import { FileType } from '@/services/database/entities/file.entity';
import { t } from 'i18next';
import ToolbarContainer from './ToolbarContainer';
import { useUIFrame } from '@/hooks';
import { useStore } from '@/store';
import { useCreateFolder } from '../FileManager/AddButton';

type FileDirPikerType = 'copy' | 'move';

interface FileDirPikerProps {
  type?: FileDirPikerType;
  folderId?: string;
  name?: string;
  excludedFolders?: string[];
  onDone?: (id?: string) => void;
}

const FileDirPiker: NavigationFunctionComponent<FileDirPikerProps> = observer(
  props => {
    const UIFrame = useUIFrame();
    const { ui } = useStore();

    useNavigationButtonPress(
      () => {
        services.nav.screens?.dismissModal('FileDirPiker');
      },
      props.componentId,
      'cancel',
    );
    const { refetch: refetchFiles } = useQuery(
      [props.folderId ?? 'root', '.files'],
      {
        enabled: false,
      },
    );
    const { data: fileResult, refetch } = useQuery(
      [props.folderId ?? 'root', '.folders'],
      async () => {
        const result = await services.api.file.list({
          parent_id: props.folderId ?? null,
          type: FileType.Folder,
        });

        const excludedFolder = props.excludedFolders?.[0];
        return excludedFolder
          ? {
              total: result.total,
              items: result.items.filter(item => item.id !== excludedFolder),
            }
          : result;
      },
      { enabled: true },
    );

    const createFolder = useCreateFolder(props.folderId, v => {
      if (props.componentId) {
        Navigation.push(props.componentId, {
          component: {
            name: 'FileDirPiker',
            passProps: {
              name: v.name,
              folderId: v.id,
              excludedFolders: props.excludedFolders,
              onDone: props.onDone,
              type: props.type,
            },
          },
        });
      }
      refetch();
      refetchFiles();
    });

    return (
      <View
        style={[
          styles.container,
          {
            paddingBottom: UIFrame.bottomTabsHeight,
            backgroundColor: ui.colors.systemBackground,
          },
        ]}>
        <FileList
          data={fileResult?.items ?? []}
          layoutType="list"
          componentId={props.componentId}
          onItemPress={item => {
            Navigation.push(props.componentId, {
              component: {
                name: 'FileDirPiker',
                passProps: {
                  name: item.name,
                  folderId: item.id,
                  excludedFolders: props.excludedFolders,
                  onDone: props.onDone,
                  type: props.type,
                },
              },
            });
          }}
        />
        <ToolbarContainer
          type={props.type}
          onDone={type => {
            if (type === 'add') {
              createFolder();
            } else {
              props.onDone?.(props.folderId);
            }
          }}
        />
      </View>
    );
  },
);

FileDirPiker.options = props => {
  return {
    topBar: {
      title: {
        text:
          props.name ??
          (props.type === 'copy' ? t('common:copy') : t('common:move')),
      },
      rightButtons: [
        {
          id: 'cancel',
          text: t('common:cancel'),
        },
      ],
    },
  };
};

export default FileDirPiker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
