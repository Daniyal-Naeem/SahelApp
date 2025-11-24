import React from 'react';
import {View} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';
import {CommonActions} from '@react-navigation/native';

const CustomDrawerContent = (props: any) => {
  const handleLogout = () => {
    // Close the drawer first
    props.navigation.closeDrawer();
    
    // Get the parent Stack navigator (the drawer is nested inside Stack)
    const parentNavigator = props.navigation.getParent();
    if (parentNavigator) {
      // Reset navigation stack to Login screen
      parentNavigator.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    } else {
      // Fallback: try using the navigation directly
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: 'Login'}],
        }),
      );
    }
  };

  return (
    <View style={{flex: 1}}>
      <DrawerContentScrollView {...props}>
        <DrawerItemList {...props} />
        <DrawerItem
          label="Logout"
          onPress={handleLogout}
        />
      </DrawerContentScrollView>
    </View>
  );
};

export default CustomDrawerContent;

