import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {Colors, Spacing, FontFamilies, r, FontSizes} from '../constants/styles';

export interface UnderPriceOption {
  label: string;
  value: number;
  currency?: string;
}

interface UnderPriceFilterProps {
  options?: UnderPriceOption[];
  selectedValue?: number | null;
  onSelect: (value: number | null) => void;
  currency?: string;
}

const DEFAULT_OPTIONS: UnderPriceOption[] = [
  {label: 'Under 10', value: 10},
  {label: 'Under 20', value: 20},
  {label: 'Under 30', value: 30},
  {label: 'Under 50', value: 50},
];

const UnderPriceFilter: React.FC<UnderPriceFilterProps> = ({
  options = DEFAULT_OPTIONS,
  selectedValue,
  onSelect,
  currency = 'SAR',
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shop by Price</Text>
      <View style={styles.optionsContainer}>
        {options.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                isSelected && styles.optionButtonActive,
              ]}
              onPress={() => {
                // Toggle: if already selected, deselect
                onSelect(isSelected ? null : option.value);
              }}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextActive,
                ]}>
                {option.label.replace('Under', `Under ${currency}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing[5],
  },
  title: {
    fontSize: FontSizes.lg,
    color: Colors.black[100],
    fontFamily: FontFamilies.mbold,
    marginBottom: Spacing[4],
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[3],
  },
  optionButton: {
    paddingHorizontal: Spacing[4],
    paddingVertical: Spacing[3],
    borderRadius: r(20),
    backgroundColor: Colors.white,
    borderWidth: r(1.5),
    borderColor: Colors.gray[300],
  },
  optionButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  optionText: {
    fontSize: FontSizes.sm,
    color: Colors.gray[600],
    fontFamily: FontFamilies.msemibold,
  },
  optionTextActive: {
    color: Colors.white,
  },
});

export default UnderPriceFilter;
