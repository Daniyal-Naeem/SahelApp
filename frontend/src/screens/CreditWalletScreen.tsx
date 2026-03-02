import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  getCreditBalance,
  formatCurrency,
  type CreditBalance,
} from '../services/creditService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

const CreditWalletScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const GoBack = () => {
    navigation.goBack();
  };

  // Load credit balance
  const loadBalance = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const creditBalance = await getCreditBalance();
        setBalance(creditBalance);
      } else {
        setBalance(null);
      }
    } catch (error: any) {
      console.error('Error loading credit balance:', error);
      toast.showToast(
        error.response?.data?.error || 'Failed to load credit balance',
        'error'
      );
      setBalance(null);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Load balance on mount and when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadBalance();
    }, [])
  );

  // Handle refresh
  const handleRefresh = () => {
    loadBalance(false);
  };

  // Navigate to top-up screen
  const handleTopup = () => {
    navigation.navigate('CreditTopup');
  };

  // Navigate to transfer screen
  const handleTransfer = () => {
    navigation.navigate('CreditTransfer');
  };

  // Navigate to history screen
  const handleHistory = () => {
    navigation.navigate('CreditHistory');
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Credit Wallet"
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
          <Text style={styles.emptyText}>Please login to view your credit wallet</Text>
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
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[Colors.primary]}
            />
          }>
          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>
              {balance
                ? formatCurrency(balance.balance, balance.currency)
                : formatCurrency(0)}
            </Text>
            <Text style={styles.balanceSubtext}>
              Credits available for purchases
            </Text>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.topupButton]}
              onPress={handleTopup}>
              <Text style={styles.actionButtonText}>Add Credits</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.transferButton]}
              onPress={handleTransfer}>
              <Text style={styles.actionButtonText}>Send Credits</Text>
            </TouchableOpacity>
          </View>

          {/* History Button */}
          <TouchableOpacity
            style={styles.historyButton}
            onPress={handleHistory}>
            <Text style={styles.historyButtonText}>View Transaction History</Text>
            <Text style={styles.historyButtonArrow}>→</Text>
          </TouchableOpacity>

          {/* Info Section */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>About Credits</Text>
            <Text style={styles.infoText}>
              • Use credits to pay for orders during checkout{'\n'}
              • Transfer credits to friends and family{'\n'}
              • Add credits using your preferred payment method{'\n'}
              • Credits never expire
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background[200],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing[4],
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
  },
  emptyText: {
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    textAlign: 'center',
    marginBottom: Spacing[6],
  },
  loginButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[6],
    paddingVertical: Spacing[4],
    borderRadius: r(8),
  },
  loginButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing[5],
  },
  balanceCard: {
    backgroundColor: Colors.white,
    borderRadius: r(16),
    padding: Spacing[6],
    alignItems: 'center',
    marginBottom: Spacing[5],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: FontSizes.base,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[2],
  },
  balanceAmount: {
    fontSize: FontSizes['3xl'],
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[2],
  },
  balanceSubtext: {
    fontSize: FontSizes.sm,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: Spacing[4],
    marginBottom: Spacing[5],
  },
  actionButton: {
    flex: 1,
    paddingVertical: Spacing[4],
    borderRadius: r(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  topupButton: {
    backgroundColor: Colors.primary,
  },
  transferButton: {
    backgroundColor: Colors.blue[500],
  },
  actionButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  historyButton: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[5],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing[5],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  historyButtonText: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.msemibold,
  },
  historyButtonArrow: {
    fontSize: FontSizes.xl,
    color: Colors.gray[500],
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: r(12),
    padding: Spacing[5],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  infoTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[3],
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    lineHeight: FontSizes.base * 1.5,
  },
});

export default CreditWalletScreen;
