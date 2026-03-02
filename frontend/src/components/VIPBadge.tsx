import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {type VIPMembership, getTierInfo} from '../services/vipService';

interface VIPBadgeProps {
  membership: VIPMembership | null;
  size?: 'small' | 'medium' | 'large';
  showTier?: boolean;
}

const VIPBadge: React.FC<VIPBadgeProps> = ({
  membership,
  size = 'medium',
  showTier = false,
}) => {
  if (!membership || !membership.isMember || membership.isExpired) {
    return null;
  }

  const tierInfo = membership.tier ? getTierInfo(membership.tier) : null;
  const badgeColor = tierInfo?.color || Colors.primary;

  const sizeStyles = {
    small: {
      container: {paddingHorizontal: Spacing[2], paddingVertical: Spacing[1]},
      text: FontSizes.xs,
      icon: r(10),
    },
    medium: {
      container: {paddingHorizontal: Spacing[3], paddingVertical: Spacing[1.5]},
      text: FontSizes.sm,
      icon: r(12),
    },
    large: {
      container: {paddingHorizontal: Spacing[4], paddingVertical: Spacing[2]},
      text: FontSizes.base,
      icon: r(14),
    },
  };

  const currentSize = sizeStyles[size];

  return (
    <View style={[styles.container, currentSize.container, {backgroundColor: badgeColor}]}>
      <Text style={[styles.badgeText, {fontSize: currentSize.text}]}>
        ⭐ VIP
      </Text>
      {showTier && tierInfo && (
        <Text style={[styles.tierText, {fontSize: currentSize.text}]}>
          {tierInfo.name}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: r(12),
    backgroundColor: Colors.primary,
    alignSelf: 'flex-start',
    gap: Spacing[1],
  },
  badgeText: {
    color: Colors.white,
    fontFamily: FontFamilies.mbold,
    fontWeight: 'bold',
  },
  tierText: {
    color: Colors.white,
    fontFamily: FontFamilies.msemibold,
    textTransform: 'uppercase',
  },
});

export default VIPBadge;
