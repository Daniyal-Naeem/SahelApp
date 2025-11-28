import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React, {useState} from 'react';
import {Text, TextInput, TouchableOpacity, View, StyleSheet} from 'react-native';
import {Colors, Spacing, FontSizes, FontFamilies} from '../constants/styles';
interface DetailsItemProps {
  title: string;
  placeholder: string;
}
type RootStackParamList = {
  ForgotPassword: undefined;
  Signup: undefined;
};
const DetailsItem = ({title, placeholder}: DetailsItemProps) => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const [changes, setChanges] = useState('');
  const [showPassword] = useState(false);
  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View>
        <TextInput
          placeholder={placeholder}
          style={styles.input}
          placeholderTextColor={'#0F0E0E73'}
          onChangeText={(e: string) => setChanges(e)}
          value={changes}
          secureTextEntry={title === 'Password' && !showPassword}
        />
        {title === 'Password' && (
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotPassword}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    marginTop: Spacing[3],
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '400',
    color: Colors.black[100],
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.neutral[500],
    color: Colors.black[100],
    fontFamily: FontFamilies.psemibold,
    fontSize: FontSizes.lg,
    borderRadius: 12,
    marginTop: Spacing[1],
    paddingHorizontal: Spacing[2],
    paddingVertical: Spacing[4],
  },
  forgotPassword: {
    color: Colors.red[600],
    fontSize: FontSizes.lg,
    fontFamily: FontFamilies.pmedium,
    alignSelf: 'flex-end',
  },
});

export default DetailsItem;
