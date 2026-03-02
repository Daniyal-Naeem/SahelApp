import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import React, {useState, useEffect} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {CustomButton, VIPBadge} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {checkAuthStatus} from '../utils/authGuard';
import {getItem} from '../utils/AsyncStorage';
import {getVIPStatus, type VIPMembership} from '../services/vipService';
import {useI18n} from '../contexts/I18nContext';

type Props = {};

const ProfileScreen = (props: Props) => {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{name?: string; email?: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vipMembership, setVipMembership] = useState<VIPMembership | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          try {
            const userData = await getItem('user');
            if (userData) {
              const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
              setUserInfo({
                name: user.name || user.username || 'User',
                email: user.email || '',
              });
            }
            // Load VIP status
            try {
              const vipStatus = await getVIPStatus();
              setVipMembership(vipStatus);
            } catch (error) {
              console.error('Error loading VIP status:', error);
              setVipMembership(null);
            }
          } catch (error) {
            console.error('Error loading user info:', error);
          }
        } else {
          setUserInfo(null);
          setVipMembership(null);
        }
        
        setIsLoading(false);
      };
      
      checkAuth();
    }, [])
  );

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  const handleSignup = () => {
    navigation.navigate('Signup');
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.contentContainer, {paddingTop: insets.top + Spacing[4]}]}>
        <View style={styles.guestContainer}>
          <Text style={styles.guestTitle}>{t('home.welcome')}</Text>
          <Text style={styles.guestSubtitle}>
            {t('profile.personalInfo')}
          </Text>
          
          <View style={styles.buttonContainer}>
            <CustomButton
              title="Login"
              handlePress={handleLogin}
              containerStyle={styles.loginButton}
            />
            <CustomButton
              title="Sign Up"
              handlePress={handleSignup}
              containerStyle={styles.signupButton}
            />
          </View>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.contentContainer, {paddingTop: insets.top + Spacing[4]}]}>
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.nameContainer}>
            <Text style={styles.profileName}>{userInfo?.name || 'User'}</Text>
            {vipMembership && (
              <VIPBadge membership={vipMembership} size="medium" showTier={true} />
            )}
          </View>
          <Text style={styles.profileEmail}>{userInfo?.email || ''}</Text>
        </View>
        {vipMembership?.isMember && !vipMembership.isExpired && (
            <TouchableOpacity
              style={styles.vipButton}
              onPress={() => navigation.navigate('VIPClub')}>
              <Text style={styles.vipButtonText}>{t('vip.vipBenefits')}</Text>
            </TouchableOpacity>
        )}
        <Text style={styles.profileMessage}>
          Profile features coming soon...
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  contentContainer: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },
  loadingText: {
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mmedium,
    color: Colors.black[100],
    textAlign: 'center',
    marginTop: Spacing[10],
  },
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[10],
    paddingHorizontal: Spacing[5],
  },
  guestTitle: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
    marginBottom: Spacing[3],
    textAlign: 'center',
  },
  guestSubtitle: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    textAlign: 'center',
    marginBottom: Spacing[8],
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: Spacing[4],
  },
  loginButton: {
    marginBottom: 0,
  },
  signupButton: {
    backgroundColor: Colors.white,
    borderWidth: r(1),
    borderColor: Colors.primary,
  },
  profileContainer: {
    paddingVertical: Spacing[6],
  },
  profileHeader: {
    marginBottom: Spacing[4],
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[2],
    flexWrap: 'wrap',
  },
  profileName: {
    fontSize: FontSizes['2xl'],
    fontFamily: FontFamilies.msemibold,
    color: Colors.black[100],
  },
  vipButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: r(8),
    alignSelf: 'flex-start',
    marginBottom: Spacing[4],
  },
  vipButtonText: {
    color: Colors.white,
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
  },
  profileEmail: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[600] || '#4B5563',
    marginBottom: Spacing[6],
  },
  profileMessage: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500] || '#6B7280',
  },
});

export default ProfileScreen;
