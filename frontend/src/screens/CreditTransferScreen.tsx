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
  transferCredits,
  getTransferLimits,
  getCreditBalance,
  formatCurrency,
  type TransferLimits,
  type CreditBalance,
} from '../services/creditService';
import {checkAuthStatus} from '../utils/authGuard';
import {useToast} from '../hooks/useToast';

const CreditTransferScreen = () => {
  const navigation = useNavigation<any>();
  const toast = useToast();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [limits, setLimits] = useState<TransferLimits | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [form, setForm] = useState({
    receiverId: '',
    receiverEmail: '',
    receiverPhone: '',
    amount: '',
    note: '',
    hideSender: false,
  });

  const [errors, setErrors] = useState({
    receiver: '',
    amount: '',
  });

  const GoBack = () => {
    navigation.goBack();
  };

  // Load balance and limits
  const loadData = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const [creditBalance, transferLimits] = await Promise.all([
          getCreditBalance(),
          getTransferLimits(),
        ]);
        setBalance(creditBalance);
        setLimits(transferLimits);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.showToast('Failed to load data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  // Validate form
  const validateForm = (): boolean => {
    const newErrors = {
      receiver: '',
      amount: '',
    };

    // Check if at least one receiver field is filled
    if (!form.receiverId && !form.receiverEmail && !form.receiverPhone) {
      newErrors.receiver = 'Please provide receiver ID, email, or phone';
    }

    // Validate amount
    const amount = parseFloat(form.amount);
    if (!form.amount || isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    } else if (limits) {
      if (amount < limits.minAmount) {
        newErrors.amount = `Minimum transfer amount is ${limits.minAmount}`;
      } else if (amount > limits.maxAmount) {
        newErrors.amount = `Maximum transfer amount is ${limits.maxAmount}`;
      } else if (balance && amount > balance.balance) {
        newErrors.amount = 'Insufficient balance';
      }
    }

    setErrors(newErrors);
    return !newErrors.receiver && !newErrors.amount;
  };

  // Handle transfer
  const handleTransfer = async () => {
    if (!validateForm()) {
      return;
    }

    Alert.alert(
      'Confirm Transfer',
      `Are you sure you want to transfer ${formatCurrency(
        parseFloat(form.amount),
        balance?.currency || 'SAR'
      )}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Confirm',
          onPress: async () => {
            setIsSubmitting(true);
            try {
              const transferData: any = {
                amount: parseFloat(form.amount),
                hideSender: form.hideSender,
              };

              if (form.receiverId) transferData.receiverId = form.receiverId;
              if (form.receiverEmail) transferData.receiverEmail = form.receiverEmail;
              if (form.receiverPhone) transferData.receiverPhone = form.receiverPhone;
              if (form.note) transferData.note = form.note;

              await transferCredits(transferData);
              toast.showToast('Credits transferred successfully!', 'success');
              
              // Reset form
              setForm({
                receiverId: '',
                receiverEmail: '',
                receiverPhone: '',
                amount: '',
                note: '',
                hideSender: false,
              });
              
              // Reload balance
              await loadData();
            } catch (error: any) {
              toast.showToast(
                error.response?.data?.error || 'Failed to transfer credits',
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
        title="Transfer Credits"
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
          <Text style={styles.emptyText}>Please login to transfer credits</Text>
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
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>
                {formatCurrency(balance.balance, balance.currency)}
              </Text>
            </View>
          )}

          {/* Transfer Limits */}
          {limits && (
            <View style={styles.limitsCard}>
              <Text style={styles.limitsTitle}>Transfer Limits</Text>
              <Text style={styles.limitsText}>
                Min: {formatCurrency(limits.minAmount, balance?.currency || 'SAR')}
                {' • '}
                Max: {formatCurrency(limits.maxAmount, balance?.currency || 'SAR')}
              </Text>
              <Text style={styles.limitsText}>
                Daily Limit: {formatCurrency(limits.dailyLimit, balance?.currency || 'SAR')}
              </Text>
            </View>
          )}

          {/* Receiver Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Receiver Information</Text>
            <Text style={styles.sectionSubtitle}>
              Provide at least one: ID, Email, or Phone
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Receiver ID (Optional)</Text>
              <TextInput
                style={styles.input}
                value={form.receiverId}
                onChangeText={text => {
                  setForm({...form, receiverId: text});
                  setErrors({...errors, receiver: ''});
                }}
                placeholder="Enter receiver ID"
                placeholderTextColor={Colors.gray[400]}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address (Optional)</Text>
              <TextInput
                style={styles.input}
                value={form.receiverEmail}
                onChangeText={text => {
                  setForm({...form, receiverEmail: text});
                  setErrors({...errors, receiver: ''});
                }}
                placeholder="Enter email address"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Phone Number (Optional)</Text>
              <TextInput
                style={styles.input}
                value={form.receiverPhone}
                onChangeText={text => {
                  setForm({...form, receiverPhone: text});
                  setErrors({...errors, receiver: ''});
                }}
                placeholder="Enter phone number"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="phone-pad"
              />
            </View>

            {errors.receiver ? (
              <Text style={styles.errorText}>{errors.receiver}</Text>
            ) : null}
          </View>

          {/* Amount */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={form.amount}
                onChangeText={text => {
                  setForm({...form, amount: text});
                  setErrors({...errors, amount: ''});
                }}
                placeholder="0.00"
                placeholderTextColor={Colors.gray[400]}
                keyboardType="decimal-pad"
              />
              <Text style={styles.currencyLabel}>
                {balance?.currency || 'SAR'}
              </Text>
            </View>
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}
          </View>

          {/* Note */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Note (Optional)</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              value={form.note}
              onChangeText={text => setForm({...form, note: text})}
              placeholder="Add a note for the receiver"
              placeholderTextColor={Colors.gray[400]}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Hide Sender Option */}
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setForm({...form, hideSender: !form.hideSender})
              }>
              <View
                style={[
                  styles.checkboxBox,
                  form.hideSender && styles.checkboxBoxChecked,
                ]}>
                {form.hideSender && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Hide sender information</Text>
            </TouchableOpacity>
          </View>

          {/* Transfer Button */}
          <TouchableOpacity
            style={[
              styles.transferButton,
              isSubmitting && styles.transferButtonDisabled,
            ]}
            onPress={handleTransfer}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.transferButtonText}>Transfer Credits</Text>
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
    marginBottom: Spacing[4],
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
  limitsCard: {
    backgroundColor: Colors.primaryLight,
    borderRadius: r(12),
    padding: Spacing[4],
    marginBottom: Spacing[5],
  },
  limitsTitle: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[2],
  },
  limitsText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
  },
  section: {
    marginBottom: Spacing[5],
  },
  sectionTitle: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[2],
  },
  sectionSubtitle: {
    fontSize: FontSizes.sm,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[4],
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
  input: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.gray[200],
    borderRadius: r(8),
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  amountInput: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mbold,
  },
  currencyLabel: {
    position: 'absolute',
    right: Spacing[4],
    top: Spacing[3] + r(20),
    fontSize: FontSizes.base,
    color: Colors.gray[500],
    fontFamily: FontFamilies.mregular,
  },
  noteInput: {
    minHeight: r(80),
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.red[500],
    fontFamily: FontFamilies.mregular,
    marginTop: Spacing[2],
  },
  checkboxContainer: {
    marginBottom: Spacing[6],
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: r(20),
    height: r(20),
    borderWidth: r(2),
    borderColor: Colors.gray[300],
    borderRadius: r(4),
    marginRight: Spacing[3],
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxBoxChecked: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    color: Colors.white,
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mbold,
  },
  checkboxLabel: {
    fontSize: FontSizes.base,
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
  },
  transferButton: {
    backgroundColor: Colors.primary,
    borderRadius: r(12),
    paddingVertical: Spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[4],
  },
  transferButtonDisabled: {
    opacity: 0.6,
  },
  transferButtonText: {
    color: Colors.white,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mbold,
  },
});

export default CreditTransferScreen;
