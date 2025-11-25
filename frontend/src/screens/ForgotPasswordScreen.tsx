import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {SvgXml} from 'react-native-svg';
import {CustomButton} from '../components';
import {radio} from '../assets/svgs/radio';
import {activeRadio} from '../assets/svgs/activeRadio';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

type Props = {};

const ForgotPasswordScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [selectedOption, setSelectedOption] = useState<'SMS' | 'Email'>('SMS');

  type RootStackParamList = {
    OTP: undefined;
  };

  const handleNext = () => {
    navigation.navigate('OTP');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Forgot Password?
      </Text>
      <View>
        <Text style={styles.description}>
          How you would like to restore your password?
        </Text>
        
        {/* SMS Option */}
        <TouchableOpacity
          onPress={() => setSelectedOption('SMS')}
          style={styles.optionContainer}>
          <View style={styles.radioContainer}>
            <SvgXml 
              xml={selectedOption === 'SMS' ? activeRadio : radio} 
              width={26} 
              height={26} 
            />
          </View>
          <Text 
            style={[
              styles.optionText,
              selectedOption === 'SMS' ? styles.optionTextSelected : styles.optionTextDefault,
              {fontFamily: FontFamilies.mmedium}
            ]}>
            SMS
          </Text>
        </TouchableOpacity>

        {/* Email Option */}
        <TouchableOpacity
          onPress={() => setSelectedOption('Email')}
          style={[styles.optionContainer, styles.optionContainerLast]}>
          <View style={styles.radioContainer}>
            <SvgXml 
              xml={selectedOption === 'Email' ? activeRadio : radio} 
              width={26} 
              height={26} 
            />
          </View>
          <Text 
            style={[
              styles.optionText,
              selectedOption === 'Email' ? styles.optionTextSelected : styles.optionTextDefault,
              {fontFamily: FontFamilies.mmedium}
            ]}>
            Email
          </Text>
        </TouchableOpacity>

        {/* Next Button */}
        <View style={styles.buttonWrapper}>
          <CustomButton
            title="Next"
            handlePress={handleNext}
            containerStyle={styles.buttonContainer}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing[5],
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: Spacing[28],
  },
  title: {
    fontSize: FontSizes['3xl'],
    marginBottom: Spacing[8],
  },
  description: {
    color: Colors.black[100],
    fontSize: FontSizes.sm,
    marginBottom: Spacing[6],
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
    padding: Spacing[4],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    borderRadius: r(8),
  },
  optionContainerLast: {
    marginBottom: Spacing[8],
  },
  radioContainer: {
    marginRight: Spacing[3],
  },
  optionText: {
    fontSize: FontSizes.sm,
  },
  optionTextDefault: {
    color: Colors.black[100],
  },
  optionTextSelected: {
    color: Colors.green[700],
  },
  buttonWrapper: {
    marginTop: 'auto',
  },
  buttonContainer: {
    marginBottom: Spacing[6],
  },
});

export default ForgotPasswordScreen;
