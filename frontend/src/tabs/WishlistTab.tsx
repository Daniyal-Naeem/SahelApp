import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Spacing} from '../constants/styles';

type Props = {};

const WishlistTab = (_props: Props) => {
  return (
    <View style={styles.container}>
      <Text>WishlistTab</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
  },
});

export default WishlistTab;
