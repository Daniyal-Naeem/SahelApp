import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {CustomButton} from '../components';

type Props = {};

const ForgotPasswordScreen = (_props: Props) => {
  const [selectedOption, setSelectedOption] = useState<'SMS' | 'Email'>('SMS');

  return (
    <View className="px-5 flex-1 bg-white pt-28">
      <Text className="text-2xl font-msemibold mb-6">
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
          <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 items-center justify-center">
            {selectedOption === 'SMS' && (
              <View className="w-3 h-3 rounded-full bg-green-500 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">✓</Text>
              </View>
            )}
          </View>
          <Text className={`text-sm font-mmedium ${selectedOption === 'SMS' ? 'text-green-500' : 'text-black-100'}`}>
            SMS
          </Text>
        </TouchableOpacity>

        {/* Email Option */}
        <TouchableOpacity
          onPress={() => setSelectedOption('Email')}
          className="flex flex-row items-center mb-6 p-3 border border-gray-200 rounded-lg">
          <View className="w-5 h-5 rounded-full border-2 border-gray-300 mr-3 items-center justify-center">
            {selectedOption === 'Email' && (
              <View className="w-3 h-3 rounded-full bg-green-500 items-center justify-center">
                <Text className="text-white text-[10px] font-bold">✓</Text>
              </View>
            )}
          </View>
          <Text className={`text-sm font-mmedium ${selectedOption === 'Email' ? 'text-green-500' : 'text-black-100'}`}>
            Email
          </Text>
        </TouchableOpacity>

        {/* Next Button */}
        <CustomButton
          title="Next"
          handlePress={() => {}}
          containerStyle="mt-auto mb-4"
        />
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;
