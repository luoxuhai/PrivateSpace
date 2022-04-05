import React, { useRef } from 'react';
import {
  TextInput,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import { NavigationComponentProps } from 'react-native-navigation';
import { useNavigationButtonPress } from 'react-native-navigation-hooks';

import { useStore } from '@/store';
import { services } from '@/services';

interface DescriptionFormProps extends NavigationComponentProps {
  item: any;
  onDone?: (value?: string) => void;
  onDismiss?: () => void;
}

const DescriptionForm = observer<DescriptionFormProps>(props => {
  const { ui } = useStore();
  const { t } = useTranslation();
  const { height } = useWindowDimensions();
  const textInputValue = useRef<string>();

  useNavigationButtonPress(
    () => {
      services.nav.screens?.dismissModal('DescriptionForm');
      props.onDismiss?.();
    },
    props.componentId,
    'cancel',
  );

  useNavigationButtonPress(
    () => {
      props.onDone?.(textInputValue.current?.trim());
      props.onDismiss?.();
      services.nav.screens?.dismissModal('DescriptionForm');
    },
    props.componentId,
    'done',
  );

  return (
    <ScrollView
      style={[
        {
          backgroundColor: ui.colors.secondarySystemBackground,
        },
      ]}>
      <TextInput
        multiline
        autoFocus
        placeholder={t('photoView:toolbar.descPlaceholder')}
        defaultValue={props.item?.description}
        placeholderTextColor={ui.colors.tertiaryLabel}
        onChangeText={text => (textInputValue.current = text)}
        style={[
          styles.input,
          {
            color: ui.colors.label,
            height: height / 2,
            backgroundColor: ui.colors.systemBackground,
          },
        ]}
      />
    </ScrollView>
  );
});

export default DescriptionForm;

const styles = StyleSheet.create({
  input: {
    padding: 16,
    fontSize: 16,
    margin: 16,
    borderRadius: 8,
  },
});
