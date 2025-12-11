import { Dimensions, Platform, StatusBar } from "react-native";

const { width } = Dimensions.get("window");

const BASE_WIDTH = 440; // Figma design width

export default function r(size: number): number {
  const scale = width / BASE_WIDTH;
  return size * scale;
}

/**
 * Get safe area top padding for headers
 * Android: uses StatusBar.currentHeight
 * iOS: uses a safe default (typically 44-50px for notched devices)
 */
export function getSafeAreaTopPadding(): number {
  if (Platform.OS === 'android') {
    return StatusBar.currentHeight || 0;
  } else if (Platform.OS === 'ios') {
    return r(44); // Safe default for iOS notched devices
  }
  return 0;
}

