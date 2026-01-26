import {useToast as useToastLibrary} from 'react-native-toast-notifications';

export const useToast = () => {
  const toast = useToastLibrary();

  const showToast = (message: string) => {
    toast.hideAll();
    toast.show(message, {
      type: 'normal',
      placement: 'bottom',
      duration: 3000,
      animationType: 'slide-in',
    });
  };

  return {showToast};
};
