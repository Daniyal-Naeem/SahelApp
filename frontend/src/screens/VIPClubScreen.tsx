import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  getVIPStatus,
  joinVIPClub,
  getTierInfo,
  formatMembershipExpiry,
  getDaysUntilExpiry,
  type VIPMembership,
} from '../services/vipService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

const VIPClubScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [membership, setMembership] = useState<VIPMembership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const GoBack = () => {
    navigation.goBack();
  };

  // Load VIP status
  const loadVIPStatus = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const status = await getVIPStatus();
        setMembership(status);
      } else {
        setMembership(null);
      }
    } catch (error) {
      console.error('Error loading VIP status:', error);
      setMembership(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Load status on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadVIPStatus();
    }, [])
  );

  // Handle join VIP Club
  const handleJoinVIP = async () => {
    Alert.alert(
      'Join VIP Club',
      'Join our VIP Club and enjoy exclusive benefits, special discounts, and early access to new products. Membership is free!',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Join Now',
          onPress: async () => {
            setIsJoining(true);
            try {
              const newMembership = await joinVIPClub();
              setMembership(newMembership);
              toast.showToast('Welcome to VIP Club!', 'success');
            } catch (error: any) {
              toast.showToast(
                error.response?.data?.error || 'Failed to join VIP Club',
                'error'
              );
            } finally {
              setIsJoining(false);
            }
          },
        },
      ]
    );
  };

  const tierInfo = membership?.tier ? getTierInfo(membership.tier) : null;
  const daysUntilExpiry = membership?.expiresAt
    ? getDaysUntilExpiry(membership.expiresAt)
    : null;

  return (
    <View style={styles.container}>
      <CustomHeader
        title={membership?.isMember ? 'VIP Club' : 'Join VIP Club'}
        onBackPress={GoBack}
        showBorder={true}
      />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) : !isAuthenticated ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Please login to view VIP Club</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Membership Status Card */}
          {membership?.isMember && !membership.isExpired ? (
            <View style={styles.membershipCard}>
              <View style={styles.membershipHeader}>
                <View style={styles.tierBadgeContainer}>
                  {tierInfo && (
                    <View
                      style={[
                        styles.tierBadge,
                        {backgroundColor: tierInfo.color + '20'},
                      ]}>
                      <Text
                        style={[styles.tierText, {color: tierInfo.color}]}>
                        {tierInfo.name} Member
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.pointsContainer}>
                  <Text style={styles.pointsLabel}>VIP Points</Text>
                  <Text style={styles.pointsValue}>{membership.points}</Text>
                </View>
              </View>

              {membership.expiresAt && (
                <View style={styles.expiryContainer}>
                  <Text style={styles.expiryLabel}>Membership expires:</Text>
                  <Text style={styles.expiryValue}>
                    {formatMembershipExpiry(membership.expiresAt)}
                  </Text>
                  {daysUntilExpiry !== null && daysUntilExpiry > 0 && (
                    <Text style={styles.daysRemaining}>
                      {daysUntilExpiry} days remaining
                    </Text>
                  )}
                </View>
              )}

              {tierInfo && (
                <View style={styles.currentTierBenefits}>
                  <Text style={styles.benefitsTitle}>
                    Your {tierInfo.name} Benefits:
                  </Text>
                  {tierInfo.benefits.map((benefit, index) => (
                    <Text key={index} style={styles.benefitItem}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          ) : membership?.isExpired ? (
            <View style={styles.expiredCard}>
              <Text style={styles.expiredTitle}>Membership Expired</Text>
              <Text style={styles.expiredText}>
                Your VIP membership has expired. Renew now to continue enjoying
                exclusive benefits!
              </Text>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinVIP}
                disabled={isJoining}>
                {isJoining ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.joinButtonText}>Renew Membership</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.joinCard}>
              <Text style={styles.joinTitle}>Join VIP Club</Text>
              <Text style={styles.joinDescription}>
                Join our VIP Club and enjoy exclusive benefits, special discounts,
                and early access to new products. Membership is free!
              </Text>
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinVIP}
                disabled={isJoining}>
                {isJoining ? (
                  <ActivityIndicator size="small" color={Colors.white} />
                ) : (
                  <Text style={styles.joinButtonText}>Join Now - Free</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* All Tiers Information */}
          <View style={styles.tiersSection}>
            <Text style={styles.sectionTitle}>VIP Membership Tiers</Text>
            <Text style={styles.sectionDescription}>
              Earn points with every purchase to unlock higher tiers and better
              benefits!
            </Text>

            {['bronze', 'silver', 'gold', 'platinum'].map(tier => {
              const info = getTierInfo(tier);
              if (!info) return null;
              const isCurrentTier = membership?.tier === tier;

              return (
                <View
                  key={tier}
                  style={[
                    styles.tierCard,
                    isCurrentTier && styles.currentTierCard,
                  ]}>
                  <View style={styles.tierCardHeader}>
                    <View
                      style={[
                        styles.tierIndicator,
                        {backgroundColor: info.color},
                      ]}
                    />
                    <View style={styles.tierCardContent}>
                      <View style={styles.tierCardTitleRow}>
                        <Text style={styles.tierCardTitle}>{info.name}</Text>
                        {isCurrentTier && (
                          <Text style={styles.currentBadge}>Current</Text>
                        )}
                      </View>
                      <Text style={styles.tierCardPoints}>
                        {info.pointsRequired === 0
                          ? 'Starting tier'
                          : `${info.pointsRequired.toLocaleString()} points required`}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.tierCardBenefits}>
                    {info.benefits.map((benefit, index) => (
                      <Text key={index} style={styles.tierBenefitItem}>
                        • {benefit}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[8],
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[4],
  },
  description: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(24),
    marginBottom: Spacing[6],
  },
  benefitsContainer: {
    marginTop: Spacing[4],
  },
  benefitItem: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    marginBottom: Spacing[3],
    lineHeight: r(24),
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[12],
    paddingHorizontal: Spacing[5],
  },
  emptyText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
    marginBottom: Spacing[4],
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[3],
    borderRadius: r(8),
  },
  loginButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
  },
  membershipCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[5],
    marginBottom: Spacing[5],
    borderWidth: r(2),
    borderColor: Colors.primaryLight,
    shadowColor: Colors.black[100],
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  tierBadgeContainer: {
    flex: 1,
  },
  tierBadge: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
    borderRadius: r(8),
    alignSelf: 'flex-start',
  },
  tierText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
    marginBottom: Spacing[1],
  },
  pointsValue: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.primary,
  },
  expiryContainer: {
    marginTop: Spacing[3],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  expiryLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    marginBottom: Spacing[1],
  },
  expiryValue: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  daysRemaining: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    marginTop: Spacing[1],
  },
  currentTierBenefits: {
    marginTop: Spacing[4],
    paddingTop: Spacing[4],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  benefitsTitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  joinCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: r(12),
    padding: Spacing[5],
    marginBottom: Spacing[5],
    alignItems: 'center',
  },
  joinTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
    textAlign: 'center',
  },
  joinDescription: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[700] || '#374151',
    lineHeight: r(24),
    marginBottom: Spacing[5],
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[8],
    paddingVertical: Spacing[4],
    borderRadius: r(8),
    minWidth: r(150),
  },
  joinButtonText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
    color: Colors.white,
    textAlign: 'center',
  },
  expiredCard: {
    backgroundColor: Colors.red[50] || '#FEF2F2',
    borderRadius: r(12),
    padding: Spacing[5],
    marginBottom: Spacing[5],
    borderWidth: r(1),
    borderColor: Colors.red[200] || '#FECACA',
  },
  expiredTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.red[600] || '#DC2626',
    marginBottom: Spacing[2],
  },
  expiredText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[700] || '#374151',
    lineHeight: r(24),
    marginBottom: Spacing[4],
  },
  tiersSection: {
    marginTop: Spacing[2],
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  sectionDescription: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    lineHeight: r(24),
    marginBottom: Spacing[5],
  },
  tierCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[4],
    borderWidth: r(1),
    borderColor: Colors.gray[200] || '#E5E7EB',
  },
  currentTierCard: {
    borderWidth: r(2),
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  tierCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[3],
  },
  tierIndicator: {
    width: r(4),
    height: r(40),
    borderRadius: r(2),
    marginRight: Spacing[3],
  },
  tierCardContent: {
    flex: 1,
  },
  tierCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing[1],
  },
  tierCardTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  currentBadge: {
    fontSize: FontSizes.xs,
    fontFamily: FontFamilies.msemibold,
    color: Colors.primary,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing[2],
    paddingVertical: r(2),
    borderRadius: r(4),
  },
  tierCardPoints: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
  tierCardBenefits: {
    marginTop: Spacing[2],
    paddingTop: Spacing[3],
    borderTopWidth: r(1),
    borderTopColor: Colors.gray[200] || '#E5E7EB',
  },
  tierBenefitItem: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[700] || '#374151',
    marginBottom: Spacing[2],
    lineHeight: r(20),
  },
});

export default VIPClubScreen;













