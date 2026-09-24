import {View, Text, ImageBackground, StyleSheet, TouchableOpacity} from 'react-native';
import React from 'react';
import {images} from '../constants';
import {CustomButton} from '../components';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';
import {RouteStackParamList} from '../../App';

type Props = {};

const GetStartedScreen = (_props: Props) => {
  const navigation = useNavigation<StackNavigationProp<RouteStackParamList>>();

  return (
    <ImageBackground
      source={images.getStartedNew}
      style={styles.background}>
      <View style={styles.spacer} />
      <View style={styles.content}>
        <Text style={styles.title}>
          You want Authentic, here you go!
        </Text>
        <Text style={styles.subtitle}>
          Find it here, buy it now!
        </Text>

        <CustomButton
          title="Start Shopping"
          containerStyle={styles.buttonContainer}
          handlePress={() => navigation.navigate('HomeScreen')}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={styles.secondaryLink}>
          <Text style={styles.secondaryText}>
            New here? <Text style={styles.secondaryAccent}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.secondaryText}>
            Already have an account?{' '}
            <Text style={styles.secondaryAccent}>Log In</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  spacer: {
    height: '55%',
  },
  content: {
    paddingHorizontal: Spacing[3],
    height: '45%',
    paddingTop: Spacing[3],
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: '100%',
  },
  title: {
    color: Colors.white,
    fontSize: 34,
    textAlign: 'center',
    fontFamily: FontFamilies.mbold,
  },
  subtitle: {
    color: '#F2F2F2',
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.pmedium,
    textAlign: 'center',
    marginTop: Spacing[3],
  },
  buttonContainer: {
    paddingVertical: Spacing[4],
    marginTop: Spacing[6],
    marginBottom: Spacing[4],
  },
  secondaryLink: {
    marginBottom: Spacing[3],
    alignItems: 'center',
  },
  secondaryText: {
    color: '#F2F2F2',
    fontSize: FontSizes.sm,
    textAlign: 'center',
    fontFamily: FontFamilies.pmedium,
  },
  secondaryAccent: {
    color: Colors.white,
    fontFamily: FontFamilies.mbold,
    textDecorationLine: 'underline',
  },
});

export default GetStartedScreen;
