import React, {useState, useEffect} from 'react';
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
import {CommonActions, useFocusEffect} from '@react-navigation/native';
import {icons} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import { SvgXml } from 'react-native-svg';
import { drawerLogo } from '../assets/svgs/drawerHome';
import { VIPIcon } from '../assets/svgs/VIPIcon';
import { wishlist } from '../assets/svgs/wishlist';
import { notification } from '../assets/svgs/notification';
import { sendGifts } from '../assets/svgs/sendGifts';
import { support } from '../assets/svgs/support';
import { language } from '../assets/svgs/languauge';
import { settings } from '../assets/svgs/settings';
import { logout } from '../assets/svgs/logout';
import { orderIcon } from '../assets/svgs/orderIcon';
import {checkAuthStatus} from '../utils/authGuard';
import {getItem} from '../utils/AsyncStorage';

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  isActive?: boolean;
}

const CustomDrawerContent = (props: any) => {
  const [activeMenuItemId, setActiveMenuItemId] = useState<string>('1'); // Default to first item
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userInfo, setUserInfo] = useState<{name?: string; email?: string} | null>(null);

  // Check authentication status when drawer opens
  useFocusEffect(
    React.useCallback(() => {
      const checkAuth = async () => {
        const authStatus = await checkAuthStatus();
        setIsAuthenticated(authStatus);
        
        if (authStatus) {
          // Load user info
          try {
            const userData = await getItem('user');
            if (userData) {
              const user = typeof userData === 'string' ? JSON.parse(userData) : userData;
              setUserInfo({
                name: user.name || user.username || 'User',
                email: user.email || '',
              });
            }
          } catch (error) {
            console.error('Error loading user info:', error);
          }
        } else {
          setUserInfo(null);
        }
      };
      
      checkAuth();
    }, [])
  );

  const menuItems: MenuItem[] = [
    {id: '1', label: 'Join VIP Club', icon: VIPIcon, route: 'VIPClub'},
    {id: '2', label: 'My Orders', icon: orderIcon, route: 'Orders'},
    {id: '3', label: 'Wishlist', icon: wishlist, route: 'Wishlist'},
    {id: '4', label: 'Notifications', icon: notification, route: 'Notifications'},
    {id: '5', label: 'Send/Redeem Gifts', icon: sendGifts, route: 'Gifts'},
    {id: '6', label: 'Support', icon: support, route: 'Support'},
    {id: '7', label: 'Language', icon: language, route: 'Language'},
    {id: '8', label: 'Settings', icon: settings, route: 'Profile'},
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    setActiveMenuItemId(item.id);

    // Close drawer first
    props.navigation.closeDrawer();
    
    if (item.route) {
      // Use setTimeout to ensure drawer is closed before navigation
      setTimeout(() => {
        try {
          // For tabs that are in the bottom tab navigator (Wishlist, Profile)
          if (item.route === 'Wishlist' || item.route === 'Profile') {
            // Navigate to Dashboard with screen param to open the specific tab
            props.navigation.navigate('Dashboard', {
              screen: item.route,
            });
          } else {
            // For other screens (VIPClub, Orders, Notifications, Support, Language, Gifts), navigate directly
            props.navigation.navigate(item.route as any);
          }
        } catch  {
          try {
            if (item.route === 'Wishlist' || item.route === 'Profile') {
              props.navigation.navigate('Dashboard', {
                initialTab: item.route,
              });
            } else {
              props.navigation.navigate(item.route as any);
            }
          } catch  {
            // Navigation failed
          }
        }
      }, 200);
    }
  };

  const handleLogout = () => {
    props.navigation.closeDrawer();
    
    const parentNavigator = props.navigation.getParent();
    if (parentNavigator) {
      parentNavigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    } else {
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    }
  };

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header/Branding Section */}
        <View style={styles.header}>
          <SvgXml xml={drawerLogo} />
        </View>

        {/* User Profile Section */}
        <View style={styles.profileSection}>
          <FastImage
            source={icons.profileIcon}
            style={styles.profileImage}
            resizeMode={FastImage.resizeMode.cover}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {isAuthenticated && userInfo?.name ? userInfo.name.toUpperCase() : 'GUEST USER'}
            </Text>
            <Text style={styles.profileEmail}>
              {isAuthenticated && userInfo?.email ? userInfo.email : 'Not logged in'}
            </Text>
          </View>
        </View>

        {/* Main Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => {
            const isActive = activeMenuItemId === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  isActive && styles.menuItemActive,
                ]}
                onPress={() => handleMenuItemPress(item)}>
                <SvgXml
                  xml={item.icon}
                  width={r(24)}
                  height={r(24)}
                  style={styles.menuIcon}
                />
                <Text
                  style={[
                    styles.menuText,
                    isActive && styles.menuTextActive,
                  ]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button - Fixed at bottom (only show if authenticated) */}
      {isAuthenticated && (
        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <SvgXml
              xml={logout}
              width={r(24)}
              height={r(24)}
              style={styles.menuIcon}
            />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuItemActive: {
    backgroundColor: '#56E5E8', // Active menu item background
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
    backgroundColor: '#FFF0F0', // Light pink background
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
