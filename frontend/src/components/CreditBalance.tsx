import React, {useState, useEffect} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ActivityIndicator} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {getCreditBalance, formatCurrency, type CreditBalance} from '../services/creditService';
import {checkAuthStatus} from '../utils/authGuard';

interface CreditBalanceProps {
  showLabel?: boolean;
  compact?: boolean;
  onPress?: () => void;
}

const CreditBalanceComponent: React.FC<CreditBalanceProps> = ({
  showLabel = true,
  compact = false,
  onPress,
}) => {
  const navigation = useNavigation<any>();
  const [balance, setBalance] = useState<CreditBalance | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loadBalance = async () => {
    setIsLoading(true);
    try {
      const authStatus = await checkAuthStatus();
      setIsAuthenticated(authStatus);

      if (authStatus) {
        const creditBalance = await getCreditBalance();
        setBalance(creditBalance);
      }
    } catch (error) {
      console.error('Error loading credit balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      navigation.navigate('CreditWallet');
    }
  };

  if (!isAuthenticated || !balance) {
    return null;
  }

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handlePress}
        activeOpacity={0.7}>
        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} />
        ) : (
          <Text style={styles.compactText}>
            {formatCurrency(balance.balance, balance.currency)}
          </Text>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}>
      {isLoading ? (
        <ActivityIndicator size="small" color={Colors.primary} />
      ) : (
        <>
          {showLabel && (
            <Text style={styles.label}>Credits</Text>
          )}
          <Text style={styles.amount}>
            {formatCurrency(balance.balance, balance.currency)}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactContainer: {
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[2],
  },
  label: {
    fontSize: FontSizes.xs,
    color: Colors.gray[600],
    fontFamily: FontFamilies.mregular,
    marginBottom: Spacing[1],
  },
  amount: {
    fontSize: FontSizes.base,
    color: Colors.primary,
    fontFamily: FontFamilies.mbold,
  },
  compactText: {
    fontSize: FontSizes.sm,
    color: Colors.primary,
    fontFamily: FontFamilies.msemibold,
  },
});

export default CreditBalanceComponent;
