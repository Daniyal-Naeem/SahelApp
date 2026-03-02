import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  type CelebrationCampaign,
  formatCampaignDiscount,
  formatCelebrationType,
} from '../services/celebrationService';

interface CelebrationCardProps {
  campaign: CelebrationCampaign;
  onPress?: () => void;
}

const CelebrationCard: React.FC<CelebrationCardProps> = ({
  campaign,
  onPress,
}) => {
  const navigation = useNavigation<any>();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to products filtered by campaign categories or deal details
      navigation.navigate('DealDetailsScreen', {
        dealType: campaign.type,
      });
    }
  };

  const getCelebrationIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      birthday: '🎂',
      wedding: '💒',
      newborn: '👶',
      anniversary: '💝',
      other: '🎉',
    };
    return iconMap[type] || '🎉';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{getCelebrationIcon(campaign.type)}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.type}>{formatCelebrationType(campaign.type)}</Text>
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {formatCampaignDiscount(campaign)}
            </Text>
          </View>
        </View>

        <Text style={styles.title} numberOfLines={2}>
          {campaign.title}
        </Text>

        {campaign.description && (
          <Text style={styles.description} numberOfLines={2}>
            {campaign.description}
          </Text>
        )}

        {campaign.applicableCategories && campaign.applicableCategories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesLabel}>
              Categories: {campaign.applicableCategories.map((cat: any) => cat.name).join(', ')}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[3],
    flexDirection: 'row',
    shadowColor: Colors.black[100],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: r(60),
    height: r(60),
    borderRadius: r(30),
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing[4],
  },
  icon: {
    fontSize: r(32),
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[2],
  },
  type: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[1],
    borderRadius: r(6),
    marginLeft: Spacing[2],
  },
  discountText: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mbold,
    color: Colors.white,
  },
  title: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  description: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[2],
  },
  categoriesContainer: {
    marginTop: Spacing[2],
  },
  categoriesLabel: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500],
  },
});

export default CelebrationCard;
