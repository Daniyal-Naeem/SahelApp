import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text, TouchableOpacity, View, StyleSheet} from 'react-native';
import {SvgXml} from 'react-native-svg';
import {CustomButton, FormField} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies, r} from '../constants/styles';
import {googleIcon} from '../assets/svgs/googleIcon';
import AppleIcon from '../assets/svgs/Apple.svg';
import FacebookIcon from '../assets/svgs/Facebook.svg';

type Props = {};

const LoginScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting] = useState(false);
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
  });
  type RootStackParamList = {
    ForgotPassword: undefined;
    Signup: undefined;
    HomeScreen: undefined;
  };
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleLogin = () => {
    navigation.navigate('HomeScreen');
  };
  const handleSignInWithProvider = () => {};
  const handleNavigateToSignUp = () => {
    navigation.navigate('Signup');
  };
  return (
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Welcome back
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
            otherStyles={styles.formFieldSmall}
          />
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPassword}>
            <Text
              style={[
                styles.forgotPasswordText,
                {fontFamily: FontFamilies.mmedium},
              ]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>
        {/* submit btn */}
        <CustomButton
          title="Login"
          handlePress={handleLogin}
          isLoading={isSubmitting}
          containerStyle={styles.buttonContainer}
        />
        {/* or continue with  */}
        <View style={styles.centerContainer}>
          <View style={styles.dividerContainer}>
       
            <Text style={styles.dividerText}>- OR Continue with -</Text>
          
          </View>
          <View style={styles.socialContainer}>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <SvgXml xml={googleIcon} width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <AppleIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignInWithProvider} style={styles.socialButton}>
              <FacebookIcon width={r(24)} height={r(24)} />
            </TouchableOpacity>
          </View>
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Create An Account</Text>
            <TouchableOpacity onPress={handleNavigateToSignUp}>
              <Text
                style={[styles.signupLink, {fontFamily: FontFamilies.mbold}]}>
                Sign Up
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
  formFieldSmall: {
    marginBottom: Spacing[3],
  },
  forgotPassword: {
    marginBottom: Spacing[6],
  },
  forgotPasswordText: {
    color: Colors.action,
    fontSize: FontSizes.xs,
    alignSelf: 'flex-end',
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
    width: r(48),
    height: r(48),
    borderRadius: r(24),
    borderWidth: 1,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: r(4),
    justifyContent: 'center',
  },
  signupText: {
    color: '#575757',
    fontSize: FontSizes.sm,
  },
  signupLink: {
    fontSize: FontSizes.sm,
    textDecorationLine: 'underline',
    color: Colors.action,
  },
});

export default LoginScreen;
