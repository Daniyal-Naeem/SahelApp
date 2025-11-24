import {View, Text} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FormField, CustomButton} from '../components';

type Props = {};

const ResetPasswordScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  type RootStackParamList = {
    Login: undefined;
  };

  const handleSubmit = () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    // Handle submit logic here
    console.log('Reset password for:', email);
    // Navigate to login screen
    navigation.navigate('Login');
  };

  return (
    <View className="px-5 flex-1 bg-white pt-28">
      <Text className="text-3xl mb-6" style={{fontFamily: 'Montserrat-SemiBold'}}>
        Forgot password?
      </Text>
      <View className="flex-1">
        <FormField
          title="Email"
          value={email}
          setError={setEmailError}
          error={emailError}
          handleChangeText={(e: string) => {
            setEmailError('');
            setEmail(e);
          }}
          placeholder="Enter your email address"
          otherStyles="mb-4"
        />

        <Text className="text-gray-500 text-sm mb-6">
          * We will send you a message to set or reset your new password
        </Text>

       
          <CustomButton
            title="Submit"
            handlePress={handleSubmit}
            containerStyle="mb-4"
          />
  
      </View>
    </View>
  );
};

export default ResetPasswordScreen;

