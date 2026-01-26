import {
  View,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Text,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import { SvgXml } from 'react-native-svg';
import { searchIcon } from '../assets/svgs/searchIcon';
import ConfirmationModal from './ConfirmationModal';

type CustomSearchProps = {
  placeholder?: string;
  initialQuery: string;
  onSearch?: (query: string) => void;
  onClear?: () => void;
  showTag?: boolean; // Show tag only when from recommendation
};

type ScreenNavigationProps = StackNavigationProp<RootStackParamList, 'Search'>;

type RootStackParamList = {
  Search: {query: string} | undefined;
};
const CustomSearch = ({
  placeholder,
  initialQuery,
  onSearch,
  onClear,
  showTag = false, // Default to false - only show tag for recommendations
}: CustomSearchProps) => {
  const navigation = useNavigation<ScreenNavigationProps>();
  const [query, setQuery] = useState(initialQuery || '');
  const [showErrorModal, setShowErrorModal] = useState(false);
  
  // Update query when initialQuery changes
  React.useEffect(() => {
    setQuery(initialQuery || '');
  }, [initialQuery]);
  
  const handlePress = () => {
    if (query.trim() === '') {
      setShowErrorModal(true);
      return;
    } else {
      if (onSearch) {
        // Local search callback - only trigger on button press or Enter
        onSearch(query.trim());
      } else {
        // Navigate to search screen (fallback)
        navigation.navigate('Search', {query: query.trim()});
        setQuery('');
      }
    }
  };

  const hasQuery = query.trim().length > 0;
  const shouldShowTag = showTag && hasQuery;

  return (
    <>
      <View style={styles.searchContainer}>
        <TouchableOpacity onPress={handlePress}>
        <SvgXml xml={searchIcon} />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          {shouldShowTag && (
            <View style={styles.tag}>
              <Text style={styles.tagText}>{query}</Text>
              <TouchableOpacity
                onPress={() => {
                  setQuery('');
                  if (onClear) {
                    onClear();
                  }
                }}
                style={styles.tagCloseButton}>
                <Text style={styles.tagCloseText}>×</Text>
              </TouchableOpacity>
            </View>
          )}
          <TextInput
            placeholder={placeholder || 'Search any Product..'}
            value={shouldShowTag ? '' : query}
            onChangeText={(e: string) => {
              setQuery(e);
              // When user types manually, clear the tag (if it was from recommendation)
              // Don't trigger search while typing - only clear if empty
              if (onClear && !e.trim()) {
                onClear();
              }
            }}
            style={[styles.input, shouldShowTag && styles.inputWithTag]}
            placeholderTextColor={'#BBBBBB'}
            onSubmitEditing={handlePress}
            returnKeyType="search"
            editable={!shouldShowTag}
          />
        </View>
      </View>
      
      <ConfirmationModal
        visible={showErrorModal}
        title="Required Field"
        message="Please fill the required field"
        secondaryButtonText="OK"
        onSecondaryPress={() => setShowErrorModal(false)}
        onClose={() => setShowErrorModal(false)}
        showIcon={false}
      />
    </>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    width: '100%',
    borderRadius: 12,
    padding:0,
    paddingVertical: Spacing[1],
    paddingHorizontal: Spacing[3],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing[2],
    gap: Spacing[1],
  },
  input: {
    color: '#BBBBBB',
    flex: 1,
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.mregular,
  },
  inputWithTag: {
    flex: 0,
    width: 0,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6EB',
    borderRadius: r(8),
    paddingHorizontal: Spacing[3],
    paddingVertical: Spacing[1],
  },
  tagText: {
    fontSize: FontSizes.base,
    fontFamily: FontFamilies.mmedium,
    color: Colors.primary,
    marginRight: Spacing[1],
  },
  tagCloseButton: {
    width: r(16),
    height: r(16),
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagCloseText: {
    fontSize: FontSizes.xl,
    fontFamily: FontFamilies.mregular,
    color: Colors.primary,
    lineHeight: r(16),
  },
});

export default CustomSearch;
