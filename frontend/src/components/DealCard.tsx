import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';
import {SvgXml} from 'react-native-svg';
import {rightArrow} from '../assets/svgs/rightArrow';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import DealCountdown from './DealCountdown';
import {Deal} from '../services/dealService';

interface DealCardProps {
  deal: Deal;
  onPress?: () => void;
  showCountdown?: boolean;
}

const DealCard: React.FC<DealCardProps> = ({
  deal,
  onPress,
  showCountdown = true,
}) => {
  const formatDiscount = () => {
    if (deal.discount) {
      return `${deal.discount}% OFF`;
    }
    if (deal.discountAmount) {
      return `SAR ${deal.discountAmount} OFF`;
    }
    return 'Special Deal';
  };

  const getDealTypeLabel = () => {
    const typeMap: Record<string, string> = {
      weekly: 'Weekly Deal',
      monthly: 'Monthly Deal',
      daily: 'Daily Deal',
      flash: 'Flash Sale',
      under_price: 'Under Price',
    };
    return typeMap[deal.type] || 'Special Deal';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{getDealTypeLabel()}</Text>
          </View>
          <Text style={styles.title}>{deal.title}</Text>
          {deal.description && (
            <Text style={styles.description} numberOfLines={2}>
              {deal.description}
            </Text>
          )}
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>{formatDiscount()}</Text>
          </View>
          {showCountdown && (
            <View style={styles.countdownContainer}>
              <DealCountdown endDate={deal.endDate} compact={true} />
            </View>
          )}
        </View>
        <View style={styles.rightSection}>
          <SvgXml xml={rightArrow} width={r(20)} height={r(20)} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    marginBottom: Spacing[3],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing[4],
  },
  leftSection: {
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
    borderRadius: r(12),
    marginBottom: Spacing[2],
  },
  badgeText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
  },
  title: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  description: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[2],
  },
  discountContainer: {
    marginBottom: Spacing[2],
  },
  discountText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  countdownContainer: {
    marginTop: Spacing[2],
  },
  rightSection: {
    marginLeft: Spacing[4],
  },
});

export default DealCard;
