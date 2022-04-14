import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTranslation } from 'react-i18next';
import LottieView from 'lottie-react-native';

import CustomButton from '@/components/CustomButton';
import { colors } from '@/utils/designSystem';
import { useStore } from '@/store';
import { services } from '@/services';

import ImageVipRight from '@/assets/images/vip/right.svg';
const lottieSource = require('@/assets/lottie/premium-gold.json');

export function handleToPurchases() {
  services.nav.screens?.show('Purchase');
}

function PurchasesCard(): JSX.Element {
  const { ui } = useStore();
  const { t } = useTranslation();

  return (
    <TouchableOpacity
      style={styles.purchasesCard}
      activeOpacity={0.8}
      onPress={handleToPurchases}>
      <LinearGradient
        style={styles.purchasesCardBg}
        start={{
          x: 0,
          y: 0.5,
        }}
        colors={['rgba(239, 134, 25, 0.6)', 'rgba(244, 164, 68, 0.5)']}
      />
      <ImageVipRight style={styles.vipRight} />
      <View style={styles.vipCrown}>
        <LottieView source={lottieSource} autoPlay loop />
      </View>
      <View>
        <Text
          style={[
            styles.purchasesCardTitle,
            {
              color: colors.light.label,
            },
          ]}>
          {t('purchase:card.title')}
        </Text>
        <Text
          style={[
            styles.purchasesCardSubTitle,
            {
              color: ui.colors.secondaryLabel,
            },
          ]}>
          {t('purchase:card.desc')}
        </Text>
      </View>

      <CustomButton
        style={styles.purchasesCardButton}
        textStyle={styles.purchasesCardButtonText}
        color={colors.light.label}
        onPress={handleToPurchases}>
        {t('purchase:card.button')}
      </CustomButton>
    </TouchableOpacity>
  );
}

export default PurchasesCard;

const styles = StyleSheet.create({
  purchasesCard: {
    height: 160,
    marginTop: 30,
    marginBottom: 20,
    marginHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'space-between',
    padding: 20,
    overflow: 'hidden',
  },
  purchasesCardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  purchasesCardSubTitle: {
    marginTop: 8,
  },
  purchasesCardButton: {
    width: 100,
    height: 34,
    borderRadius: 20,
  },
  purchasesCardButtonText: {
    fontSize: 13,
  },
  purchasesCardBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  vipRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  vipCrown: {
    position: 'absolute',
    bottom: '40%',
    right: 30,
    width: 60,
    height: 60,
  },
});
