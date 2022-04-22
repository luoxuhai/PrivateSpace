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
import { QuickLook } from 'react-native-app-toolkit';
import Modal from 'react-native-modal';

interface FileViewProps {
  url: string;
}

const FileView = observer<FileViewProps>(props => {
  return (
    <>
      <QuickLook.View
        style={{
          flex: 1,
          backgroundColor: '#F00',
        }}
        url={props.url}
      />
    </>
  );
});

export default FileView;
