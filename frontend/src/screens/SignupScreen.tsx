import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {CustomButton, FormField} from '../components';
import {icons} from '../constants';

type Props = {};
// let's go with get started first
const SignupScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, _setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  type RootStackParamList = {
    ForgotPassword: undefined;
    Login: undefined;
  };
  const handleLogin = () => {};
  const handleSignInWithProvider = () => {};
  const handleNavigateToLogin = () => {
    navigation.navigate('Login');
  };
  return (
    <View className="px-5 flex-1 bg-white pt-28">
      <Text className="text-2xl font-msemibold mb-6">
        Create an account
      </Text>
      <View>
        {/* text input */}
        <FormField
          title="Username or Email"
          value={form.email}
          setError={setEmailError}
          error={emailError}
          handleChangeText={(e: any) => {
            setEmailError('');
            setForm({...form, email: e});
          }}
          placeholder="Username or Email"
          otherStyles="mb-4"
        />
        <View>
          <FormField
            title="Password"
            value={form.password}
            setError={setPasswordError}
            error={passwordError}
            handleChangeText={(e: any) => {
              setPasswordError('');
              setForm({...form, password: e});
            }}
            placeholder="Password"
            otherStyles="mb-4"
          />
          <FormField
            title="Confirm Password"
            value={form.confirmPassword}
            setError={setPasswordError}
            error={passwordError}
            handleChangeText={(e: any) => {
              setPasswordError('');
              setForm({...form, confirmPassword: e});
            }}
            placeholder="Confirm Password"
            otherStyles="mb-4"
          />

          <Text className="text-[#676767] text-xs font-mmedium mb-4">
            By clicking the <Text className="text-red-600">Register</Text> button, you agree to the public offer
          </Text>
        </View>
        {/* submit btn */}
        <CustomButton
          title="Create Account"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle="mb-4"
        />
        {/* or continue with  */}
        <View className="self-center">
          <View className="flex flex-row items-center justify-center mb-3">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-[#575757] text-xs mx-3">
              - OR Continue with -
            </Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>
          <View className="flex flex-row items-center gap-3 mb-4 justify-center">
            {ContinueWithData.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={handleSignInWithProvider}
                  className="rounded-full bg-white border border-gray-200 w-10 h-10 items-center justify-center shadow-sm">
                  <Image
                    source={item.image}
                    className="w-5 h-5"
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View className="flex flex-row items-center gap-x-1 justify-center">
            <Text className="text-[#575757] text-sm">
              I Already Have an Account
            </Text>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <Text className="text-sm font-mbold underline text-action">
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

export default SignupScreen;

type ContinueWithType = {
  image: ImageSourcePropType | undefined;
  id: number;
  name: string;
};

const ContinueWithData: ContinueWithType[] = [
  {
    id: 0,
    name: 'google',
    image: icons.google,
  },
  {
    id: 1,
    name: 'apple',
    image: icons.apple,
  },
  {
    id: 2,
    name: 'facebook',
    image: icons.facebook,
  },
];
