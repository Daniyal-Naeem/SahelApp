import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const BASE_WIDTH = 440; // Figma design width

export default function r(size: number): number {
  const scale = width / BASE_WIDTH;
  return size * scale;
}

