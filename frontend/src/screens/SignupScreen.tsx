import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {
  Image,
  ImageSourcePropType,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import {CustomButton, FormField} from '../components';
import {icons} from '../constants';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';

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
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
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
          otherStyles={styles.formField}
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
            otherStyles={styles.formField}
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
            otherStyles={styles.formField}
          />

          <Text style={[styles.termsText, {fontFamily: FontFamilies.mmedium}]}>
            By clicking the <Text style={styles.termsTextRed}>Register</Text> button, you agree to the public offer
          </Text>
        </View>
        {/* submit btn */}
        <CustomButton
          title="Create Account"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
        {/* or continue with  */}
        <View style={styles.centerContainer}>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>
              - OR Continue with -
            </Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.socialContainer}>
            {ContinueWithData.map((item) => {
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={handleSignInWithProvider}
                  style={styles.socialButton}>
                  <Image
                    source={item.image}
                    style={styles.socialIcon}
                    resizeMode="contain"
                  />
                </TouchableOpacity>
              );
            })}
          </View>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>
              I Already Have an Account
            </Text>
            <TouchableOpacity onPress={handleNavigateToLogin}>
              <Text style={[styles.loginLink, {fontFamily: FontFamilies.mbold}]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
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
  formField: {
    marginBottom: Spacing[6],
  },
  termsText: {
    color: '#676767',
    fontSize: FontSizes.xs,
    marginBottom: Spacing[6],
    marginTop: Spacing[2],
  },
  termsTextRed: {
    color: Colors.red[600],
  },
  buttonContainer: {
    marginBottom: Spacing[8],
  },
  centerContainer: {
    alignSelf: 'center',
    marginTop: Spacing[4],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing[5],
  },
  divider: {
    flex: 1,
    height: r(1),
    backgroundColor: Colors.gray[300],
  },
  dividerText: {
    color: '#575757',
    fontSize: FontSizes.xs,
    marginHorizontal: Spacing[3],
  },
  socialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    marginBottom: Spacing[6],
    justifyContent: 'center',
  },
  socialButton: {
    borderRadius: 9999,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    width: r(40),
    height: r(40),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  socialIcon: {
    width: r(20),
    height: r(20),
  },
  loginContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    justifyContent: 'center',
  },
  loginText: {
    color: '#575757',
    fontSize: FontSizes.sm,
  },
  loginLink: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
    color: Colors.action,
  },
});

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
