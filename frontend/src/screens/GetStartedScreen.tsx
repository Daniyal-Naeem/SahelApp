import {View, Text, ImageBackground, StyleSheet} from 'react-native';
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

  const GetStarted = () => {
    navigation.navigate('HomeScreen');
  };
  return (
    <ImageBackground
      source={images.getStartedNew}
      style={styles.background}>
      {/* push it to bottom instead of a big margin */}
      <View style={styles.spacer} />
      <View style={styles.content}>
        <Text style={styles.title}>
          You want Authentic, here you go!
        </Text>
        <Text style={styles.subtitle}>
          Find it here, buy it now!
        </Text>

        <CustomButton
          title="Get Started"
          containerStyle={styles.buttonContainer}
          handlePress={GetStarted}
        />
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
    height: '60%',
  },
  content: {
    paddingHorizontal: Spacing[3],
    height: '40%',
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
    marginVertical: Spacing[8],
  },
});

export default GetStartedScreen;
