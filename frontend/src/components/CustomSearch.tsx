import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
} from 'react-native';
import FastImage from 'react-native-fast-image';
import React, {useState} from 'react';
import {icons} from '../constants';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type CustomSearchProps = {
  placeholder?: string;
  initialQuery: string;
};

type ScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Search'>;
type ScreenRouteProps = RouteProp<RootStackParamList, 'Search'>;

type RootStackParamList = {
  Search: {query: string} | undefined;
};
const CustomSearch: React.FC<CustomSearchProps> = ({
  placeholder,
  initialQuery,
}) => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const route = useRoute<ScreenRouteProps>();
  const [query, setQuery] = useState('' || initialQuery);
  const handlePress = () => {
    if (query === '') {
      return Alert.alert('Please fill the required field');
    } else {
      navigation.navigate('Search', {query});
      setQuery('');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handlePress}>
          <FastImage
            source={icons.search}
            style={styles.searchIcon}
            resizeMode={FastImage.resizeMode.contain}
          />
        </TouchableOpacity>
        <TextInput
          placeholder={placeholder || 'Search any Product..'}
          value={query}
          onChangeText={(e: string) => setQuery(e)}
          style={styles.input}
          placeholderTextColor={'#BBBBBB'}
          onSubmitEditing={handlePress}
        />
        <FastImage source={icons.mic} style={styles.micIcon} resizeMode={FastImage.resizeMode.contain} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: Spacing[3],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    width: '100%',
    borderRadius: 12,
    paddingRight: Spacing[5],
    height: 64,
  },
  searchIcon: {
    width: 24,
    height: 24,
    marginHorizontal: Spacing[4],
  },
  input: {
    color: '#BBBBBB',
    flex: 1,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
    backgroundColor: Colors.white,
  },
  micIcon: {
    width: 32,
    height: 32,
  },
});

export default CustomSearch;
