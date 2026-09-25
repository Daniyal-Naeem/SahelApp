import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import {ScreenProps} from '../constants/types';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';
import {ProductCard, CustomHeader} from '../components';
import {sendGiftToEmail} from '../services/creditGiftService';
import {useAppSelector} from '../store';
import {useI18n} from '../i18n/I18nContext';
import {formatMoney, roundMoney} from '../utils/formatMoney';

const SendGiftScreen = ({route}: ScreenProps<'SendGift'>) => {
  const navigation = useNavigation<ScreenProps<'SendGift'>['navigation']>();
  const {itemDetails} = route.params || {};
  const {t} = useI18n();
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const amount = roundMoney(Number(itemDetails?.price) || 0);

  const GoBack = () => {
    navigation.goBack();
  };

  const NavigateToCart = () => {
    const parent = navigation.getParent();
    if (parent) {
      parent.navigate('Cart', {itemDetails: itemDetails!});
    }
  };

  const handleSend = async () => {
    if (!isAuthenticated) {
      (navigation as any).navigate('Login');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Email required', 'Enter the recipient email address');
      return;
    }
    if (amount <= 0) {
      Alert.alert('Invalid amount', 'Product price is missing');
      return;
    }
    setLoading(true);
    try {
      await sendGiftToEmail({
        email: email.trim(),
        amount,
        message:
          message.trim() ||
          `Gift: ${itemDetails?.title || 'Sahal product'} (SAR ${formatMoney(amount)})`,
      });
      Alert.alert(t('giftSent'), `SAR ${formatMoney(amount)} sent to ${email.trim()}`);
      navigation.goBack();
    } catch (error: any) {
      Alert.alert(
        'Send failed',
        error?.response?.data?.error || error?.message || 'Try again',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CustomHeader
        title={t('sendGift')}
        onBackPress={GoBack}
        showCart={true}
        onCartPress={NavigateToCart}
        showBorder={true}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {itemDetails ? (
          <ProductCard
            itemDetails={itemDetails}
            showTotalItem={true}
            totalItems={1}
          />
        ) : null}

        <View style={styles.recipientSection}>
          <Text style={styles.recipientTitle}>{t('recipientDetails')}</Text>
          <Text style={styles.amountHint}>
            {t('amount')}: SAR {formatMoney(amount)}
          </Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('emailAddress')}</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="recipient@email.com"
              placeholderTextColor="#9E9E9E"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={message}
              onChangeText={setMessage}
              placeholder="Optional message"
              placeholderTextColor="#9E9E9E"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={loading}>
          <Text style={styles.sendButtonText}>
            {loading ? '…' : t('send')}
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  recipientSection: {
    marginTop: Spacing[6],
  },
  recipientTitle: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
  },
  amountHint: {
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    marginBottom: Spacing[4],
  },
  inputContainer: {
    marginBottom: Spacing[4],
  },
  inputLabel: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    marginBottom: Spacing[2],
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: r(8),
    padding: Spacing[3],
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
  },
  messageInput: {
    minHeight: r(72),
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: Spacing[6],
    backgroundColor: Colors.primary,
    borderRadius: r(8),
    paddingVertical: Spacing[4],
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.msemibold,
  },
});

export default SendGiftScreen;
