import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {icons} from '../constants';
import PurchaseIcon from '../assets/svgs/purchase.svg';
import GiftIcon from '../assets/svgs/gift.svg';

type GiftType = 'voucher' | 'gift';
type GiftStatus = 'collected' | 'redeem';

interface GiftItem {
  id: string;
  type: GiftType;
  title: string;
  description: string;
  subDescription?: string;
  validUntil: string;
  status: GiftStatus;
}

const GiftScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'received' | 'shared'>('received');

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToProfile = () => {
    // Navigate to Profile tab
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {
        screen: 'Profile',
      },
    });
  };

  const receivedGifts: GiftItem[] = [
    {
      id: '1',
      type: 'voucher',
      title: 'Voucher',
      description: 'First Purchase',
      subDescription: '25% off for your next order',
      validUntil: '5.16.20',
      status: 'collected',
    },
    {
      id: '2',
      type: 'gift',
      title: 'Gift',
      description: 'Gift From Ahmed Ali',
      subDescription: 'Ahmed Ali sent you a gift of SAR 250',
      validUntil: '6.20.20',
      status: 'collected',
    },
    {
      id: '3',
      type: 'gift',
      title: 'Gift',
      description: 'Gift From Abu Rehan',
      subDescription: 'Abu Rehan sent Women printed Kurta as a gift.',
      validUntil: '6.20.20',
      status: 'redeem',
    },
  ];

  const sharedGifts: GiftItem[] = [
    // Add shared gifts data here when available
  ];

  const renderGiftCard = (item: GiftItem) => {
    const isVoucher = item.type === 'voucher';
    const isCollected = item.status === 'collected';

    return (
      <View key={item.id} style={styles.cardWrapper}>
        {/* Half circle cutout on left */}
        <View style={styles.cutoutLeft} />
        
        <View style={styles.giftCard}>
          {/* Top Section */}
          <View style={styles.cardTopSection}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.validUntil}>Valid Until {item.validUntil}</Text>
          </View>

          {/* Dashed divider line */}
          <View style={styles.dashedDivider} />

          {/* Bottom Section */}
          <View style={styles.cardBottomSection}>
            <View style={styles.bottomLeftContent}>
              <View style={styles.iconContainer}>
                {isVoucher ? (
                  <PurchaseIcon width={r(24)} height={r(24)} />
                ) : (
                  <GiftIcon width={r(24)} height={r(24)} />
                )}
              </View>
              <View style={styles.textContent}>
                <Text style={styles.description}>{item.description}</Text>
                {item.subDescription && (
                  <Text style={styles.subDescription}>{item.subDescription}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.actionButton,
                isCollected ? styles.collectedButton : styles.redeemButton,
              ]}>
              <Text
                style={[
                  styles.actionButtonText,
                  isCollected
                    ? styles.collectedButtonText
                    : styles.redeemButtonText,
                ]}>
                {isCollected ? 'Collected' : 'Redeem'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

      
        <View style={styles.cutoutRight} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        showLogo={true}
        onBackPress={handleGoBack}
        rightComponent={
          <TouchableOpacity onPress={navigateToProfile}>
            <FastImage
              source={icons.profileIcon}
              style={styles.profileIcon}
              resizeMode={FastImage.resizeMode.cover}
            />
          </TouchableOpacity>
        }
        showBorder={true}
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'received' && styles.tabActive,
          ]}
          onPress={() => setActiveTab('received')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}>
            Received Gifts
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'shared' && styles.tabActive]}
          onPress={() => setActiveTab('shared')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'shared' && styles.tabTextActive,
            ]}>
            Shared Gifts
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {activeTab === 'received' ? (
          receivedGifts.length > 0 ? (
            receivedGifts.map(item => renderGiftCard(item))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No received gifts</Text>
            </View>
          )
        ) : sharedGifts.length > 0 ? (
          sharedGifts.map(item => renderGiftCard(item))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No shared gifts</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  profileIcon: {
    width: r(40),
    height: r(40),
    borderRadius: r(20),
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[2],
    gap: Spacing[2],
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing[3],
    paddingHorizontal: Spacing[4],
    borderRadius: r(8),
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFEEF1',
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  tabTextActive: {
    fontFamily: FontFamilies.msemibold,
    color: Colors.red[500] || '#EF4444',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  cardWrapper: {
    marginBottom: Spacing[4],
    position: 'relative',
    marginHorizontal: r(10), // Space for cutouts
  },
  giftCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    borderWidth: r(1.5),
    borderColor: Colors.red[500] || '#EF4444',
    overflow: 'hidden',
  },
  cutoutLeft: {
    position: 'absolute',
    left: r(-10),
    top: '50%',
    width: r(20),
    height: r(20),
    borderRadius: r(10),
    backgroundColor: Colors.white,
    marginTop: r(-10),
    zIndex: 2,
    // Create cutout effect by matching background and border
    borderWidth: r(1.5),
    borderColor: Colors.red[500] || '#EF4444',
  },
  cutoutRight: {
    position: 'absolute',
    right: r(-10),
    top: '50%',
    width: r(20),
    height: r(20),
    borderRadius: r(10),
    backgroundColor: Colors.white,
    marginTop: r(-10),
    zIndex: 2,
    // Create cutout effect by matching background and border
    borderWidth: r(1.5),
    borderColor: Colors.red[500] || '#EF4444',
  },
  cardTopSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[1],
  },
  cardTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.msemibold,
    color: Colors.red[500] || '#EF4444',
  },
  validUntil: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  dashedDivider: {
    marginHorizontal: Spacing[4],
    marginVertical: Spacing[1],
    borderTopWidth: r(1),
    borderTopColor: Colors.red[500] || '#EF4444',
    borderStyle: 'dashed',
  },
  cardBottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing[4],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[3],
  },
  bottomLeftContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Spacing[3],
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: r(2),
  },
  textContent: {
    flex: 1,
  },
  description: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  subDescription: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
    lineHeight: r(20),
  },
  actionButton: {
    paddingVertical: Spacing[2],
    paddingHorizontal: Spacing[4],
    borderRadius: r(8),
    minWidth: r(80),
    alignItems: 'center',
  },
  collectedButton: {
    backgroundColor: '#009220',
  },
  redeemButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
  },
  collectedButtonText: {
    color: Colors.white,
  },
  redeemButtonText: {
    color: Colors.white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
});

export default GiftScreen;
