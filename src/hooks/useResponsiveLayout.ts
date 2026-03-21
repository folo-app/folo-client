import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return {
    width,
    height,
    isNarrow: width < 380,
    isCompact: width < 430,
    isMedium: width >= 430 && width < 900,
    isLarge: width >= 900,
    tileColumns: width < 380 ? 2 : width < 760 ? 3 : 4,
  };
}
