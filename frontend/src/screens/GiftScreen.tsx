import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import FastImage from 'react-native-fast-image';
import {CustomHeader, CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {icons} from '../constants';
import GiftIcon from '../assets/svgs/gift.svg';
import {
  getMyGiftCards,
  redeemGiftCode,
  sendGiftToEmail,
} from '../services/creditGiftService';
import {useAppSelector} from '../store';
import {useI18n} from '../i18n/I18nContext';
import {formatMoney} from '../utils/formatMoney';

type GiftStatus = 'collected' | 'redeem' | 'active';

interface GiftItem {
  id: string;
  code: string;
  type: 'gift';
  title: string;
  description: string;
  subDescription?: string;
  validUntil: string;
  status: GiftStatus;
  amount: number;
}

const formatDate = (value?: string | Date) => {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return `${d.getMonth() + 1}.${d.getDate()}.${String(d.getFullYear()).slice(-2)}`;
};

const GiftScreen = () => {
  const navigation = useNavigation<any>();
  const {t} = useI18n();
  const user = useAppSelector(s => s.auth.user);
  const isAuthenticated = useAppSelector(s => s.auth.isAuthenticated);
  const [activeTab, setActiveTab] = useState<'received' | 'shared'>('received');
  const [receivedGifts, setReceivedGifts] = useState<GiftItem[]>([]);
  const [sharedGifts, setSharedGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [sendEmail, setSendEmail] = useState('');
  const [sendAmount, setSendAmount] = useState('50');
  const [sendMessage, setSendMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const navigateToProfile = () => {
    (navigation as any).navigate('HomeScreen', {
      screen: 'Dashboard',
      params: {screen: 'Profile'},
    });
  };

  const mapCards = (cards: any[]): {received: GiftItem[]; shared: GiftItem[]} => {
    const myId = String(user?._id || '');
    const received: GiftItem[] = [];
    const shared: GiftItem[] = [];

    cards.forEach(card => {
      const assignedId = String(card.assignedTo?._id || card.assignedTo || '');
      const purchasedId = String(card.purchasedBy?._id || card.purchasedBy || '');
      const redeemed = card.status === 'redeemed';
      const item: GiftItem = {
        id: String(card._id),
        code: card.code,
        type: 'gift',
        title: t('gifts'),
        description:
          purchasedId && purchasedId !== myId
            ? `Gift From ${card.purchasedBy?.name || card.purchasedBy?.email || 'Sahal'}`
            : `Gift Card ${card.code}`,
        subDescription: `SAR ${formatMoney(card.amount)} · ${card.code}`,
        validUntil: formatDate(card.expiresAt),
        status: redeemed ? 'collected' : 'redeem',
        amount: Number(card.amount) || 0,
      };

      if (assignedId === myId || String(card.redeemedBy?._id || card.redeemedBy || '') === myId) {
        received.push(item);
      }
      if (purchasedId === myId) {
        shared.push({
          ...item,
          description: `Sent to ${card.assignedTo?.name || card.assignedTo?.email || 'recipient'}`,
          status: redeemed ? 'collected' : 'active',
        });
      }
    });

    return {received, shared};
  };

  const loadGifts = useCallback(async () => {
    if (!isAuthenticated) {
      setReceivedGifts([]);
      setSharedGifts([]);
      return;
    }
    setLoading(true);
    try {
      const cards = await getMyGiftCards();
      const mapped = mapCards(cards);
      setReceivedGifts(mapped.received);
      setSharedGifts(mapped.shared);
    } catch {
      // keep empty on error
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user?._id, t]);

  useFocusEffect(
    useCallback(() => {
      loadGifts();
    }, [loadGifts]),
  );

  const ensureAuth = () => {
    if (!isAuthenticated) {
      navigation.navigate('Login');
      return false;
    }
    return true;
  };

  const handleRedeemCard = async (code: string) => {
    if (!ensureAuth()) return;
    setBusy(true);
    try {
      await redeemGiftCode(code);
      Alert.alert(t('giftRedeemed'));
      setRedeemCode('');
      await loadGifts();
    } catch (error: any) {
      Alert.alert(
        'Redeem failed',
        error?.response?.data?.error || error?.message || 'Try again',
      );
    } finally {
      setBusy(false);
    }
  };

  const handleSendGift = async () => {
    if (!ensureAuth()) return;
    const amount = parseFloat(sendAmount);
    if (!sendEmail.trim() || !amount || amount <= 0) {
      Alert.alert('Invalid', 'Enter recipient email and a positive amount');
      return;
    }
    setBusy(true);
    try {
      await sendGiftToEmail({
        email: sendEmail.trim(),
        amount,
        message: sendMessage.trim() || undefined,
      });
      Alert.alert(t('giftSent'));
      setSendEmail('');
      setSendMessage('');
      setSendAmount('50');
      setActiveTab('shared');
      await loadGifts();
    } catch (error: any) {
      Alert.alert(
        'Send failed',
        error?.response?.data?.error || error?.message || 'Try again',
      );
    } finally {
      setBusy(false);
    }
  };

  const renderGiftCard = (item: GiftItem) => {
    const isCollected = item.status === 'collected';
    const canRedeem = item.status === 'redeem' && activeTab === 'received';

    return (
      <View key={item.id} style={styles.cardWrapper}>
        <View style={styles.cutoutLeft} />
        <View style={styles.giftCard}>
          <View style={styles.cardTopSection}>
            <Text style={styles.cardTitle}>Gift</Text>
            <Text style={styles.validUntil}>Valid Until {item.validUntil}</Text>
          </View>
          <View style={styles.dashedDivider} />
          <View style={styles.cardBottomSection}>
            <View style={styles.bottomLeftContent}>
              <View style={styles.iconContainer}>
                <GiftIcon width={r(24)} height={r(24)} />
              </View>
              <View style={styles.textContent}>
                <Text style={styles.description}>{item.description}</Text>
                {item.subDescription && (
                  <Text style={styles.subDescription}>{item.subDescription}</Text>
                )}
              </View>
            </View>
            {canRedeem ? (
              <TouchableOpacity
                style={[styles.actionButton, styles.redeemButton]}
                disabled={busy}
                onPress={() => handleRedeemCard(item.code)}>
                <Text style={[styles.actionButtonText, styles.redeemButtonText]}>
                  {t('redeem')}
                </Text>
              </TouchableOpacity>
            ) : (
              <View style={[styles.actionButton, styles.collectedButton]}>
                <Text style={[styles.actionButtonText, styles.collectedButtonText]}>
                  {isCollected ? t('collected') : item.status === 'active' ? 'Sent' : t('collected')}
                </Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.cutoutRight} />
      </View>
    );
  };

  const list = activeTab === 'received' ? receivedGifts : sharedGifts;

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

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}>
          <Text
            style={[
              styles.tabText,
              activeTab === 'received' && styles.tabTextActive,
            ]}>
            {t('receivedGifts')}
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
            {t('sharedGifts')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadGifts} />
        }>
        <View style={styles.formBox}>
          <Text style={styles.formTitle}>{t('redeemCode')}</Text>
          <TextInput
            style={styles.input}
            value={redeemCode}
            onChangeText={setRedeemCode}
            placeholder={t('enterCode')}
            placeholderTextColor="#9E9E9E"
            autoCapitalize="characters"
          />
          <CustomButton
            title={t('redeem')}
            handlePress={() => handleRedeemCard(redeemCode.trim())}
            isLoading={busy}
            containerStyle={styles.formButton}
          />
        </View>

        <View style={styles.formBox}>
          <Text style={styles.formTitle}>{t('sendGift')}</Text>
          <TextInput
            style={styles.input}
            value={sendEmail}
            onChangeText={setSendEmail}
            placeholder={t('emailAddress')}
            placeholderTextColor="#9E9E9E"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            value={sendAmount}
            onChangeText={setSendAmount}
            placeholder={t('amount')}
            placeholderTextColor="#9E9E9E"
            keyboardType="decimal-pad"
          />
          <TextInput
            style={[styles.input, styles.messageInput]}
            value={sendMessage}
            onChangeText={setSendMessage}
            placeholder="Message (optional)"
            placeholderTextColor="#9E9E9E"
          />
          <CustomButton
            title={t('send')}
            handlePress={handleSendGift}
            isLoading={busy}
            containerStyle={styles.formButton}
          />
          <TouchableOpacity
            onPress={() => navigation.navigate('BuyCredits')}
            style={styles.buyLink}>
            <Text style={styles.buyLinkText}>{t('buyCredits')}</Text>
          </TouchableOpacity>
        </View>

        {loading && list.length === 0 ? (
          <ActivityIndicator color={Colors.primary} style={{marginTop: Spacing[6]}} />
        ) : list.length > 0 ? (
          list.map(item => renderGiftCard(item))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('noGifts')}</Text>
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
  formBox: {
    marginBottom: Spacing[5],
    padding: Spacing[4],
    borderRadius: r(12),
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  formTitle: {
    fontFamily: FontFamilies.msemibold,
    fontSize: FontSizes.base,
    marginBottom: Spacing[3],
    color: Colors.black[100],
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: r(8),
    padding: Spacing[3],
    marginBottom: Spacing[3],
    color: Colors.black[100],
    fontFamily: FontFamilies.mregular,
  },
  messageInput: {
    minHeight: r(64),
  },
  formButton: {
    marginTop: Spacing[1],
  },
  buyLink: {
    marginTop: Spacing[3],
    alignItems: 'center',
  },
  buyLinkText: {
    color: Colors.primary,
    fontFamily: FontFamilies.msemibold,
  },
  cardWrapper: {
    marginBottom: Spacing[4],
    position: 'relative',
    marginHorizontal: r(10),
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
