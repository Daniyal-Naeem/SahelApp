import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {CommonActions} from '@react-navigation/native';
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

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  isActive?: boolean;
}

const CustomDrawerContent = (props: any) => {
  const menuItems: MenuItem[] = [
    {id: '1', label: 'Join VIP Club', icon: VIPIcon, isActive: true},
    {id: '2', label: 'Wishlist', icon: wishlist},
    {id: '3', label: 'Notifications', icon: notification},
    {id: '4', label: 'Send/Redeem Gifts', icon: sendGifts},
    {id: '5', label: 'Support', icon: support},
    {id: '6', label: 'Language', icon: language},
    {id: '7', label: 'Settings', icon: settings},
  ];

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.route) {
      props.navigation.navigate(item.route);
    }
    props.navigation.closeDrawer();
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
          <Image
            source={icons.profileIcon}
            style={styles.profileImage}
            resizeMode="cover"
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>SAM KAMERON</Text>
            <Text style={styles.profileEmail}>samkam@gmail.com</Text>
          </View>
        </View>

        {/* Main Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                item.isActive && styles.menuItemActive,
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
                  item.isActive && styles.menuTextActive,
                ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </DrawerContentScrollView>

      {/* Logout Button - Fixed at bottom */}
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
