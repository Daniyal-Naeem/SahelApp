import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {Spacing} from '../constants/styles';

type Props = {};

const CartTab = (_props: Props) => {
  return (
    <View style={styles.container}>
      <Text>CartTab</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
  },
});

export default CartTab;
