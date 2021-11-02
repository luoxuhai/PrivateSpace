import React, {
  forwardRef,
  useImperativeHandle,
  useMemo,
  useRef,
  useCallback,
  useEffect,
} from 'react';
import {
  TouchableHighlight,
  TouchableOpacityProps,
  OpaqueColorValue,
  ViewStyle,
  Pressable,
  StyleSheet,
  View,
  Text,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { IconProps } from 'react-native-vector-icons/Icon';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetModalProps,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';

import { useStore } from '@/store';
import { IconButton } from '@/components/Icon';

interface IBottomSheetProps extends BottomSheetModalProps {
  children?: JSX.Element;
  header?: React.ReactNode;
  snapPoints?: (string | number)[];
  onDismiss?: () => void;
}

export interface IBottomSheetPropsRef {
  open: () => void;
  close: () => void;
}

export const BottomSheet = forwardRef<IBottomSheetPropsRef, IBottomSheetProps>(
  (props, ref) => {
    const { ui } = useStore();
    const bottomSheetModalRef = useRef<BottomSheetModal>(null);

    const renderBackdrop = useCallback(
      props => (
        <BottomSheetBackdrop
          {...props}
          appearsOnIndex={1}
          disappearsOnIndex={null}
          opacity={0.2}
        />
      ),
      [],
    );

    const handleShow = useCallback(async () => {
      bottomSheetModalRef.current?.present();
    }, []);

    async function handleClose() {
      bottomSheetModalRef.current?.close();
    }

    useImperativeHandle(ref, () => ({
      open() {
        handleShow();
      },
      close() {
        handleClose();
      },
    }));

    const renderHeader = () => {
      return (
        <View
          style={[
            styles.header,
            {
              borderBottomColor: ui.colors.separator,
            },
          ]}>
          {typeof props.header === 'string' ? (
            <Text
              style={[
                styles.title,
                {
                  color: ui.colors.label,
                },
              ]}>
              {props.header}
            </Text>
          ) : (
            props.header
          )}
          <IconButton
            name="ios-close"
            size={20}
            color={ui.colors.secondaryLabel}
            onPress={handleClose}
            containerStyle={[
              styles.closeBtn,
              {
                backgroundColor: ui.colors.systemGray6,
              },
            ]}
          />
        </View>
      );
    };

    return (
      <BottomSheetModalProvider>
        {/* <Pressable style={styles.background} onPress={handleClose}> */}
        <BottomSheetModal
          ref={bottomSheetModalRef}
          backdropComponent={renderBackdrop}
          handleIndicatorStyle={{
            backgroundColor: ui.colors.secondaryLabel,
          }}
          backgroundStyle={{
            backgroundColor:
              ui.appearance === 'dark'
                ? ui.colors.secondarySystemBackground
                : ui.colors.systemBackground,
          }}
          index={1}
          enableDismissOnClose
          snapPoints={props.snapPoints ?? [200, 250]}
          onDismiss={props.onDismiss}>
          {props.children}
        </BottomSheetModal>
        {/* </Pressable> */}
      </BottomSheetModalProvider>
    );
  },
);

const styles = StyleSheet.create({
  background: {
    position: 'absolute',
    zIndex: 999,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    minHeight: 50,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  closeBtn: {
    marginLeft: 'auto',
    alignSelf: 'flex-start',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    paddingLeft: 30,
    fontSize: 17,
    fontWeight: '500',
  },
});
