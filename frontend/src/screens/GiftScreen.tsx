import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {icons} from '../constants';
import PurchaseIcon from '../assets/svgs/purchase.svg';
import GiftIcon from '../assets/svgs/gift.svg';
import {
  getUserGiftCards,
  redeemGiftCard,
  formatGiftCardStatus,
  formatExpiryDate,
  GiftCard,
} from '../services/giftCardService';
import {checkAuthStatus} from '../utils/authGuard';

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
  giftCard?: GiftCard; // Store original gift card data
}

const GiftScreen = () => {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'received' | 'shared'>('received');
  const [receivedGifts, setReceivedGifts] = useState<GiftItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

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

  // Load gift cards from API
  useFocusEffect(
    React.useCallback(() => {
      const loadGiftCards = async () => {
        setIsLoading(true);
        try {
          const authStatus = await checkAuthStatus();
          setIsAuthenticated(authStatus);

          if (authStatus) {
            const giftCards = await getUserGiftCards();
            
            // Map gift cards to GiftItem format
            const mappedGifts: GiftItem[] = giftCards.map((card: GiftCard) => {
              // Determine type based on card properties
              const isVoucher = card.type === 'digital' && !card.purchasedBy;
              const senderName = card.purchasedBy?.name || card.assignedTo?.name || 'Unknown';
              
              return {
                id: card._id,
                type: isVoucher ? 'voucher' : 'gift',
                title: isVoucher ? 'Voucher' : 'Gift',
                description: isVoucher 
                  ? 'Gift Card' 
                  : `Gift From ${senderName}`,
                subDescription: isVoucher
                  ? `SAR ${card.amount} gift card`
                  : `${senderName} sent you a gift of SAR ${card.amount}`,
                validUntil: formatExpiryDate(card.expiresAt),
                status: formatGiftCardStatus(card.status),
                giftCard: card,
              };
            });

            setReceivedGifts(mappedGifts);
          } else {
            setReceivedGifts([]);
          }
        } catch (error) {
          console.error('Error loading gift cards:', error);
          // Keep empty array on error
          setReceivedGifts([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadGiftCards();
    }, [])
  );

  // Handle gift card redemption
  const handleRedeem = async (item: GiftItem) => {
    if (!item.giftCard || item.status === 'collected') {
      return;
    }

    if (!isAuthenticated) {
      Alert.alert('Login Required', 'Please login to redeem gift cards');
      return;
    }

    try {
      Alert.alert(
        'Redeem Gift Card',
        `Are you sure you want to redeem this gift card? You will receive SAR ${item.giftCard.amount} in credits.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Redeem',
            onPress: async () => {
              try {
                await redeemGiftCard(item.giftCard!.code);
                Alert.alert('Success', `Gift card redeemed! SAR ${item.giftCard!.amount} has been added to your account.`);
                // Reload gift cards
                const giftCards = await getUserGiftCards();
                const mappedGifts: GiftItem[] = giftCards.map((card: GiftCard) => {
                  const isVoucher = card.type === 'digital' && !card.purchasedBy;
                  const senderName = card.purchasedBy?.name || card.assignedTo?.name || 'Unknown';
                  
                  return {
                    id: card._id,
                    type: isVoucher ? 'voucher' : 'gift',
                    title: isVoucher ? 'Voucher' : 'Gift',
                    description: isVoucher ? 'Gift Card' : `Gift From ${senderName}`,
                    subDescription: isVoucher
                      ? `SAR ${card.amount} gift card`
                      : `${senderName} sent you a gift of SAR ${card.amount}`,
                    validUntil: formatExpiryDate(card.expiresAt),
                    status: formatGiftCardStatus(card.status),
                    giftCard: card,
                  };
                });
                setReceivedGifts(mappedGifts);
              } catch (error: any) {
                Alert.alert('Error', error.response?.data?.error || 'Failed to redeem gift card');
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error redeeming gift card:', error);
    }
  };

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
              ]}
              onPress={() => !isCollected && handleRedeem(item)}
              disabled={isCollected}>
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
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.emptyText, {marginTop: Spacing[4]}]}>Loading gift cards...</Text>
          </View>
        ) : activeTab === 'received' ? (
          !isAuthenticated ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Please login to view your gift cards</Text>
            </View>
          ) : receivedGifts.length > 0 ? (
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
    backgroundColor: Colors.primaryLight,
  },
  tabText: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#6B7280',
  },
  tabTextActive: {
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
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
    borderColor: Colors.primary,
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
    borderColor: Colors.primary,
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
    borderColor: Colors.primary,
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
    color: Colors.primary,
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
    borderTopColor: Colors.primary,
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
