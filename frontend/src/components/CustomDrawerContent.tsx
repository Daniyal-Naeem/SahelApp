import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {CommonActions} from '@react-navigation/native';
import {icons} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {SvgXml} from 'react-native-svg';
import {drawerLogo} from '../assets/svgs/drawerHome';
import {VIPIcon} from '../assets/svgs/VIPIcon';
import {wishlist} from '../assets/svgs/wishlist';
import {notification} from '../assets/svgs/notification';
import {sendGifts} from '../assets/svgs/sendGifts';
import {support} from '../assets/svgs/support';
import {language} from '../assets/svgs/languauge';
import {settings} from '../assets/svgs/settings';
import {logout} from '../assets/svgs/logout';
import {orderIcon} from '../assets/svgs/orderIcon';
import {useAppDispatch, useAppSelector} from '../store';
import {performLogout} from '../services/session';
import {useI18n} from '../i18n/I18nContext';

interface MenuItem {
  id: string;
  labelKey: string;
  icon: string;
  route?: string;
}

const CustomDrawerContent = (props: any) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const {t} = useI18n();
  const [activeMenuItemId, setActiveMenuItemId] = useState<string>('1');

  const menuItems: MenuItem[] = useMemo(() => {
    const items: MenuItem[] = [
      {id: '1', labelKey: 'vipClub', icon: VIPIcon, route: 'VIPClub'},
      {id: '2', labelKey: 'myOrders', icon: orderIcon, route: 'Orders'},
      {id: '3', labelKey: 'wishlist', icon: wishlist, route: 'Wishlist'},
      {id: '4', labelKey: 'notifications', icon: notification, route: 'Notifications'},
      {id: '5', labelKey: 'gifts', icon: sendGifts, route: 'Gifts'},
      {id: 'bc', labelKey: 'buyCredits', icon: sendGifts, route: 'BuyCredits'},
      {id: '6', labelKey: 'support', icon: support, route: 'Support'},
      {id: '7', labelKey: 'language', icon: language, route: 'Language'},
      {id: '8', labelKey: 'settings', icon: settings, route: 'Profile'},
    ];

    if (user?.role === 'vendor') {
      items.splice(2, 0,
        {id: 'v1', labelKey: 'myProducts', icon: orderIcon, route: 'VendorProducts'},
        {id: 'v2', labelKey: 'addProduct', icon: sendGifts, route: 'VendorAddProduct'},
      );
    }

    return items;
  }, [user?.role]);

  const handleMenuItemPress = (item: MenuItem) => {
    setActiveMenuItemId(item.id);
    props.navigation.closeDrawer();

    if (!item.route) return;

    setTimeout(() => {
      try {
        if (item.route === 'Wishlist' || item.route === 'Profile') {
          props.navigation.navigate('Dashboard', {screen: item.route});
        } else {
          props.navigation.navigate(item.route as any);
        }
      } catch {
        // ignore
      }
    }, 200);
  };

  const handleLogout = async () => {
    props.navigation.closeDrawer();
    await performLogout(dispatch);
    const parentNavigator = props.navigation.getParent();
    // Stay in the app as a guest — do not force the Login screen.
    const resetAction = CommonActions.reset({
      index: 0,
      routes: [{name: 'HomeScreen'}],
    });
    if (parentNavigator) {
      parentNavigator.dispatch(resetAction);
    } else {
      props.navigation.dispatch(resetAction);
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SvgXml xml={drawerLogo} />
        </View>

        <View style={styles.profileSection}>
          <FastImage
            source={icons.profileIcon}
            style={styles.profileImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {user?.name || 'Guest User'}
            </Text>
            <Text style={styles.profileEmail}>
              {user?.email || 'Sign in to continue'}
            </Text>
            {user?.role === 'vendor' && (
              <Text style={styles.roleBadge}>
                Vendor · {user.vendorStatus || 'pending'}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.menuContainer}>
          {menuItems.map(item => {
            const isActive = activeMenuItemId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.menuItem, isActive && styles.menuItemActive]}
                onPress={() => handleMenuItemPress(item)}>
                <SvgXml
                  xml={item.icon}
                  width={r(24)}
                  height={r(24)}
                  style={styles.menuIcon}
                />
                <Text
                  style={[styles.menuText, isActive && styles.menuTextActive]}>
                  {t(item.labelKey)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      <View style={styles.logoutContainer}>
        {user ? (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <SvgXml
              xml={logout}
              width={r(24)}
              height={r(24)}
              style={styles.menuIcon}
            />
            <Text style={styles.logoutText}>{t('logout')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              props.navigation.closeDrawer();
              const parent = props.navigation.getParent();
              (parent || props.navigation).navigate('Login');
            }}>
            <Text style={styles.logoutText}>{t('signIn')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    borderTopRightRadius: r(20),
    borderBottomRightRadius: r(20),
  },
  scrollContent: {
    paddingTop: Spacing[6],
  },
  header: {
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[6],
  },
  profileImage: {
    width: r(60),
    height: r(60),
    borderRadius: r(30),
    marginRight: Spacing[4],
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.black[100],
    marginBottom: Spacing[1],
  },
  profileEmail: {
    fontSize: FontSizes.sm,
    fontFamily: FontFamilies.mregular,
    color: Colors.gray[500],
  },
  roleBadge: {
    marginTop: Spacing[1],
    fontSize: FontSizes.xs,
    color: Colors.primary,
    fontFamily: FontFamilies.mmedium,
    textTransform: 'capitalize',
  },
  menuContainer: {
    paddingHorizontal: Spacing[5],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderRadius: r(12),
    marginBottom: Spacing[2],
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemActive: {
    backgroundColor: '#56E5E8',
  },
  menuIcon: {
    marginRight: Spacing[4],
  },
  menuText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mregular,
    color: Colors.black[100],
    flex: 1,
  },
  menuTextActive: {
    fontFamily: FontFamilies.msemibold,
  },
  logoutContainer: {
    paddingHorizontal: Spacing[8],
    paddingTop: Spacing[2],
    paddingBottom: Spacing[8],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    paddingHorizontal: Spacing[4],
    borderRadius: r(12),
    backgroundColor: '#FFF0F0',
    borderWidth: 1,
    borderColor: Colors.red[500],
  },
  logoutText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mbold,
    color: Colors.red[500],
    flex: 1,
  },
});

export default CustomDrawerContent;
