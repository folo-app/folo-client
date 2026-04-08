import type { StyleProp, ViewStyle } from 'react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

type FoloLogoMarkProps = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

export function FoloLogoMark({ size = 96, style }: FoloLogoMarkProps) {
  const radius = size * 0.219;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: radius }, style]}>
      <Svg height={size} viewBox="0 0 1024 1024" width={size}>
        <Defs>
          <LinearGradient id="bg" x1="160" x2="864" y1="120" y2="904">
            <Stop offset="0" stopColor="#FAFCFF" />
            <Stop offset="1" stopColor="#ECF5F4" />
          </LinearGradient>
          <LinearGradient id="bluePanel" x1="288" x2="456" y1="272" y2="744">
            <Stop offset="0" stopColor="#2563EB" />
            <Stop offset="1" stopColor="#1749B5" />
          </LinearGradient>
          <LinearGradient id="greenPanel" x1="536" x2="712" y1="536" y2="712">
            <Stop offset="0" stopColor="#56AEA6" />
            <Stop offset="1" stopColor="#2C817A" />
          </LinearGradient>
          <LinearGradient id="barFill" x1="360" x2="648" y1="322" y2="386">
            <Stop offset="0" stopColor="#F4F7FB" />
            <Stop offset="1" stopColor="#EDF3F9" />
          </LinearGradient>
        </Defs>

        <Rect fill="url(#bg)" height="832" rx="224" width="832" x="96" y="96" />
        <Rect fill="#FFFFFF" height="608" rx="152" width="608" x="208" y="208" />
        <Rect fill="url(#bluePanel)" height="472" rx="88" width="176" x="288" y="272" />
        <Rect fill="#DCE8FF" height="136" rx="68" width="176" x="536" y="288" />
        <Rect fill="url(#greenPanel)" height="176" rx="88" width="176" x="536" y="536" />
        <Rect
          fill="url(#barFill)"
          height="64"
          rx="32"
          stroke="#E2E9F2"
          strokeWidth="6"
          width="288"
          x="360"
          y="322"
        />
        <Rect
          fill="url(#barFill)"
          height="56"
          rx="28"
          stroke="#E2E9F2"
          strokeWidth="6"
          width="168"
          x="360"
          y="468"
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
});
