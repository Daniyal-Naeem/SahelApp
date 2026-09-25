import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {CustomHeader, CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {demoTopupCredits} from '../services/creditGiftService';
import {getCreditBalance} from '../services/authService';
import {useI18n} from '../i18n/I18nContext';
import {formatMoney} from '../utils/formatMoney';
import {useAppSelector} from '../store';

const PRESETS = [50, 100, 200, 500];

const BuyCreditsScreen = () => {
  const navigation = useNavigation<any>();
  const {t} = useI18n();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [amount, setAmount] = useState('100');
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    getCreditBalance()
      .then(setBalance)
      .catch(() => setBalance(0));
  }, [isAuthenticated]);

  const handleTopup = async () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return;
    }
    const value = parseFloat(amount);
    if (!value || value < 10) {
      Alert.alert('Invalid amount', 'Minimum top-up is SAR 10.00');
      return;
    }
    setLoading(true);
    try {
      const result = await demoTopupCredits(value);
      setBalance(result.balance);
      Alert.alert(t('topupSuccess'), `+ SAR ${formatMoney(result.amount)}`);
    } catch (error: any) {
      Alert.alert(
        'Top-up failed',
        error?.response?.data?.error || error?.message || 'Please try again',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={t('buyCreditsTitle')}
        onBackPress={() => navigation.goBack()}
        showBorder
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.hint}>{t('buyCreditsHint')}</Text>
        {balance !== null && (
          <Text style={styles.balance}>
            {t('wallet')}: SAR {formatMoney(balance)}
          </Text>
        )}
        <Text style={styles.label}>{t('amount')}</Text>
        <TextInput
          style={styles.input}
          keyboardType="decimal-pad"
          value={amount}
          onChangeText={setAmount}
          placeholder="100.00"
          placeholderTextColor="#9E9E9E"
        />
        <View style={styles.presets}>
          {PRESETS.map(p => (
            <TouchableOpacity
              key={p}
              style={[
                styles.preset,
                amount === String(p) && styles.presetActive,
              ]}
              onPress={() => setAmount(String(p))}>
              <Text
                style={[
                  styles.presetText,
                  amount === String(p) && styles.presetTextActive,
                ]}>
                {p}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <CustomButton
          title={t('confirmTopup')}
          handlePress={handleTopup}
          isLoading={loading}
          containerStyle={styles.button}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: Colors.white},
  content: {padding: Spacing[5]},
  hint: {
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600],
    marginBottom: Spacing[4],
    lineHeight: r(22),
  },
  balance: {
    fontFamily: FontFamilies.msemibold,
    fontSize: FontSizes.lg,
    marginBottom: Spacing[5],
    color: Colors.black[100],
  },
  label: {
    fontFamily: FontFamilies.mmedium,
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: r(8),
    padding: Spacing[3],
    fontSize: FontSizes.lg,
    marginBottom: Spacing[4],
    color: Colors.black[100],
  },
  presets: {flexDirection: 'row', flexWrap: 'wrap', gap: Spacing[2], marginBottom: Spacing[6]},
  preset: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[2],
    borderRadius: r(20),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  presetActive: {backgroundColor: Colors.primary, borderColor: Colors.primary},
  presetText: {fontFamily: FontFamilies.mmedium, color: Colors.black[100]},
  presetTextActive: {color: Colors.white},
  button: {marginTop: Spacing[2]},
});

export default BuyCreditsScreen;
