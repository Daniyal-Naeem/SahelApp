import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {SvgXml} from 'react-native-svg';
import {CustomButton} from '../components';
import {radio} from '../assets/svgs/radio';
import {activeRadio} from '../assets/svgs/activeRadio';

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
    <View className="px-5 flex-1 bg-white pt-28">
      <Text className="text-3xl mb-6" style={{fontFamily: 'Montserrat-SemiBold'}}>
        Forgot Password?
      </Text>
      <View>
        <Text className="text-black-100 text-sm mb-4">
          How you would like to restore your password?
        </Text>
        
        {/* SMS Option */}
        <TouchableOpacity
          onPress={() => setSelectedOption('SMS')}
          className="flex flex-row items-center mb-3 p-3 border border-gray-200 rounded-lg">
          <View className="mr-3">
            <SvgXml 
              xml={selectedOption === 'SMS' ? activeRadio : radio} 
              width={26} 
              height={26} 
            />
          </View>
          <Text 
            className={`text-sm ${selectedOption === 'SMS' ? 'text-green-700' : 'text-black-100'}`}
            style={{fontFamily: 'Montserrat-Medium'}}>
            SMS
          </Text>
        </TouchableOpacity>

        {/* Email Option */}
        <TouchableOpacity
          onPress={() => setSelectedOption('Email')}
          className="flex flex-row items-center mb-6 p-3 border border-gray-200 rounded-lg">
          <View className="mr-3">
            <SvgXml 
              xml={selectedOption === 'Email' ? activeRadio : radio} 
              width={26} 
              height={26} 
            />
          </View>
          <Text 
            className={`text-sm ${selectedOption === 'Email' ? 'text-green-700' : 'text-black-100'}`}
            style={{fontFamily: 'Montserrat-Medium'}}>
            Email
          </Text>
        </TouchableOpacity>

        {/* Next Button */}
        <CustomButton
          title="Next"
          handlePress={handleNext}
          containerStyle="mt-auto mb-4"
        />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
