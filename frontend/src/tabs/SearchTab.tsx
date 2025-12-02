import {View, Text, StyleSheet} from 'react-native';
import React from 'react';
import {RouteProp} from '@react-navigation/native';
import {Spacing} from '../constants/styles';

type RootStackParamList = {
  Search: {query: string} | undefined;
};
type ScreenRouteProps = RouteProp<RootStackParamList, 'Search'>;

interface SearchProps {
  route: ScreenRouteProps;
}

const SearchTab = ({route}: SearchProps) => {
  const {query} = route.params || {}; // destructure the query from route
  return (
    <View style={styles.container}>
      <Text>SearchTab</Text>
      <Text>Search For {query} </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing[5], // Consistent horizontal padding
  },
});

export default SearchTab;
