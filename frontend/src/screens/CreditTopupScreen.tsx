import {useNavigation, useFocusEffect} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {CustomHeader} from '../components';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {
  initiateTopup,
  getCreditBalance,
  formatCurrency,
  type CreditBalance,
} from '../services/creditService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

const QUICK_AMOUNTS = [50, 100, 200, 500];

const CreditTopupScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const GoBack = () => {
    navigation.goBack();
  };

  // Load balance
  const loadBalance = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const creditBalance = await getCreditBalance();
        setBalance(creditBalance);
      }
    } catch (error: any) {
      console.error('Error loading balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadBalance();
    }, [])
  );

  // Handle quick amount selection
  const handleQuickAmount = (quickAmount: number) => {
    setAmount(quickAmount.toString());
    setError('');
  };

  // Validate amount
  const validateAmount = (): boolean => {
    const amountValue = parseFloat(amount);
    if (!amount || isNaN(amountValue) || amountValue <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    if (amountValue < 10) {
      setError('Minimum top-up amount is 10');
      return false;
    }
    if (amountValue > 10000) {
      setError('Maximum top-up amount is 10,000');
      return false;
    }
    setError('');
    return true;
  };

  // Handle top-up
  const handleTopup = async () => {
    if (!validateAmount()) {
      return;
    }

    Alert.alert(
      'Add Credits',
      `Add ${formatCurrency(parseFloat(amount), balance?.currency || 'SAR')} to your wallet?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Continue',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const result = await initiateTopup({
                amount: parseFloat(amount),
                paymentMethod: 'card',
              });

              // In a real app, you would redirect to payment gateway here
              // For now, we'll show a success message
              toast.showToast(
                `Top-up initiated. Payment gateway integration pending.`,
                'success'
              );
              
              // Reset form
              setAmount('');
              
              // Reload balance after a delay (simulating payment completion)
              setTimeout(() => {
                loadBalance();
              }, 2000);
            } catch (error: any) {
              toast.showToast(
                error.response?.data?.error || 'Failed to initiate top-up',
                'error'
              );
            } finally {
              setIsSubmitting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title="Add Credits"
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
          <Text style={styles.emptyText}>Please login to add credits</Text>
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
          {/* Balance Display */}
          {balance && (
            <View style={styles.balanceCard}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(balance.balance, balance.currency)}
              </Text>
            </View>
          )}

          {/* Quick Amounts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Amounts</Text>
            <View style={styles.quickAmountsContainer}>
              {QUICK_AMOUNTS.map(quickAmount => (
                <TouchableOpacity
                  key={quickAmount}
                  style={[
                    styles.quickAmountButton,
                    amount === quickAmount.toString() &&
                      styles.quickAmountButtonActive,
                  ]}
                  onPress={() => handleQuickAmount(quickAmount)}>
                  <Text
                    style={[
                      styles.quickAmountText,
                      amount === quickAmount.toString() &&
                        styles.quickAmountTextActive,
                    ]}>
                    {formatCurrency(quickAmount, balance?.currency || 'SAR')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Custom Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Amount</Text>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount</Text>
              <View style={styles.amountInputContainer}>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={text => {
                    setAmount(text);
                    setError('');
                  }}
                  placeholder="0.00"
                  placeholderTextColor={Colors.gray[400]}
                  keyboardType="decimal-pad"
                />
                <Text style={styles.currencyLabel}>
                  {balance?.currency || 'SAR'}
                </Text>
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
          </View>

          {/* Info */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Payment Information</Text>
            <Text style={styles.infoText}>
              • Minimum top-up: {formatCurrency(10, balance?.currency || 'SAR')}
              {'\n'}
              • Maximum top-up: {formatCurrency(10000, balance?.currency || 'SAR')}
              {'\n'}
              • Credits will be added instantly after payment confirmation
              {'\n'}
              • Payment gateway integration pending
            </Text>
          </View>

          {/* Top-up Button */}
          <TouchableOpacity
            style={[
              styles.topupButton,
              isSubmitting && styles.topupButtonDisabled,
            ]}
            onPress={handleTopup}
            disabled={isSubmitting || !amount}>
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.topupButtonText}>Add Credits</Text>
            )}
          </TouchableOpacity>
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
    borderRadius: r(12),
    padding: Spacing[5],
    alignItems: 'center',
    marginBottom: Spacing[5],
  },
  balanceLabel: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[2],
  },
  balanceAmount: {
    fontSize: FontSizes['2xl'],
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
  },
  section: {
    marginBottom: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderWidth: r(2),
    borderColor: Colors.gray[200],
    borderRadius: r(12),
    padding: Spacing[4],
    alignItems: 'center',
  },
  quickAmountButtonActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  quickAmountText: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.msemibold,
  },
  quickAmountTextActive: {
    color: Colors.primary,
  },
  inputContainer: {
    marginBottom: Spacing[4],
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[2],
  },
  amountInputContainer: {
    position: 'relative',
  },
  amountInput: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[4],
    paddingRight: Spacing[16],
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
  },
  currencyLabel: {
    position: 'absolute',
    right: Spacing[4],
    top: Spacing[4] + r(20),
    fontSize: FontSizes.base,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.red[500],
    fontFamily: FontFamilies.mregular,
    marginTop: Spacing[2],
  },
  infoCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[5],
  },
  infoTitle: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[2],
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    lineHeight: FontSizes.base * 1.5,
  },
  topupButton: {
    backgroundColor: Colors.primary,
    borderRadius: r(12),
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
  },
  topupButtonDisabled: {
    opacity: 0.6,
  },
  topupButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
});

export default CreditTopupScreen;
