import {View, Text, FlatList} from 'react-native';
import React from 'react';
interface CustomWrapperProps {
  children: React.ReactNode;
}
const CustomWrapper = ({children}: CustomWrapperProps) => {
  return (
    <FlatList
      data={[{key: '1'}]}
      renderItem={() => <View>{children}</View>}
      keyExtractor={item => item.key}
    />
  );
};

export default CustomWrapper;
