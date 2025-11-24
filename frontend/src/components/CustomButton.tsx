import {Text, TouchableOpacity, ActivityIndicator} from 'react-native';
import React from 'react';

type CustomButtonProps = {
  title: string;
  handlePress: () => void;
  containerStyle?: string;
  testStyles?: string;
  isLoading?: boolean;
  textStyle?: string;
};

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  handlePress,
  containerStyle,
  isLoading,
  textStyle,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={` bg-action rounded-lg w-full flex flex-row justify-center items-center py-3 ${containerStyle} ${
        isLoading ? 'opacity-50' : ''
      }  `}
      disabled={isLoading}>
      <Text className={`text-white font-mbold text-lg ${textStyle || ''} `}>
        {title}
      </Text>
      {isLoading && (
        <ActivityIndicator
          animating={isLoading}
          color={'#fff'}
          className="ml-2"
        />
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
