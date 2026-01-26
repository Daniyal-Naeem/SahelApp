import {View, Text, StyleSheet} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {FormField, CustomButton} from '../components';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';

type Props = {};

const ResetPasswordScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  type RootStackParamList = {
    GetStarted: undefined;
  };

  const handleSubmit = () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    navigation.navigate('GetStarted');
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, {fontFamily: FontFamilies.msemibold}]}>
        Forgot password?
      </Text>
      <View style={styles.content}>
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
          otherStyles={styles.formField}
        />

        <Text style={styles.infoText}>
          * We will send you a message to set or reset your new password
        </Text>
       
          <CustomButton
            title="Submit"
            handlePress={handleSubmit}
          containerStyle={styles.buttonContainer}
          />
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
  content: {
    flex: 1,
  },
  formField: {
    marginBottom: Spacing[6],
  },
  infoText: {
    color: Colors.gray[500],
    fontSize: FontSizes.sm,
    marginBottom: Spacing[8],
    marginTop: Spacing[2],
  },
  buttonContainer: {
    marginBottom: Spacing[6],
  },
});

export default ResetPasswordScreen;

