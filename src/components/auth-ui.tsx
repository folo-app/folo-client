import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  type StyleProp,
  Text,
  TextInput,
  useWindowDimensions,
  type TextInputProps,
  type ViewStyle,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

type AuthScreenLayoutProps = {
  badge: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
  heroVariant?: 'default' | 'compact';
  children: ReactNode;
};

type AuthFieldProps = TextInputProps & {
  label: string;
  helper?: string;
};

type AuthNoticeProps = {
  tone?: 'default' | 'positive' | 'danger';
  children: ReactNode;
};

export function AuthScreenLayout({
  badge,
  title,
  subtitle,
  footer,
  heroVariant = 'default',
  children,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width < 430;
  const narrow = width < 380;
  const stackedCompactHero = heroVariant === 'compact' && width < 520;
  const stackedDefaultHero = heroVariant === 'default';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 12, 28),
            paddingBottom: Math.max(insets.bottom + 24, 32),
            minHeight: height,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.shell,
            {
              paddingHorizontal: compact ? 18 : 22,
              maxWidth: compact ? 480 : 540,
            },
          ]}
        >
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />

          <View
            style={[
              heroVariant === 'compact' ? styles.heroCardCompactMode : styles.heroCard,
              compact && styles.heroCardCompact,
              heroVariant === 'compact' && compact && styles.heroCardCompactFullBleed,
            ]}
          >
            <View
              style={[
                heroVariant === 'compact'
                  ? styles.compactHeroLayout
                  : styles.defaultHeroLayout,
                stackedCompactHero && styles.compactHeroLayoutStacked,
                narrow && heroVariant === 'compact' && styles.compactHeroLayoutNarrow,
              ]}
            >
              <View
                style={[
                  heroVariant === 'compact'
                    ? styles.compactCopyArea
                    : styles.defaultCopyArea,
                ]}
              >
                <View style={styles.brandBar}>
                  <View style={[styles.brandMark, heroVariant === 'compact' && styles.brandMarkCompact]}>
                    <Text style={[styles.brandMarkText, heroVariant === 'compact' && styles.brandMarkTextCompact]}>
                      Fo
                    </Text>
                  </View>
                  <View style={styles.brandMeta}>
                    <Text style={styles.badge}>{badge}</Text>
                    <Text style={[styles.brandName, heroVariant === 'compact' && styles.brandNameCompact]}>
                      FOLO
                    </Text>
                  </View>
                </View>

                <View style={styles.copyBlock}>
                  <Text
                    style={[
                      styles.heroTitle,
                      compact && styles.heroTitleCompact,
                      heroVariant === 'compact' && styles.heroTitleTight,
                      stackedCompactHero && styles.heroTitleStackedCompact,
                      stackedDefaultHero && compact && styles.heroTitleDefaultCompact,
                    ]}
                  >
                    {title}
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      heroVariant === 'compact' && styles.heroSubtitleTight,
                      stackedCompactHero && styles.heroSubtitleStackedCompact,
                      stackedDefaultHero && compact && styles.heroSubtitleDefaultCompact,
                    ]}
                  >
                    {subtitle}
                  </Text>
                </View>
              </View>

              {heroVariant === 'compact' ? (
                <View
                  style={[
                    styles.compactGraphicArea,
                    stackedCompactHero && styles.compactGraphicAreaStacked,
                  ]}
                >
                  <AuthCharacterShowcase />
                </View>
              ) : null}
            </View>

            {heroVariant === 'default' ? (
              <View style={styles.signalRow}>
                <View style={styles.signalPill}>
                  <Text style={styles.signalLabel}>친구 피드와 포트폴리오를 한 흐름으로</Text>
                </View>
                <View style={styles.signalPill}>
                  <Text style={styles.signalLabel}>인증 후 바로 포트폴리오 구성 시작</Text>
                </View>
              </View>
            ) : null}
          </View>

          <View style={[styles.formCard, compact && styles.formCardCompact]}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthCharacterShowcase() {
  return (
    <View style={styles.showcase}>
      <View style={styles.showcaseGlow} />
      <View style={styles.exchangeBoard}>
        <View style={styles.exchangeHeader}>
          <View style={styles.exchangeHeaderDots}>
            <View style={[styles.exchangeDot, styles.exchangeDotBlue]} />
            <View style={[styles.exchangeDot, styles.exchangeDotMint]} />
            <View style={[styles.exchangeDot, styles.exchangeDotAmber]} />
          </View>
          <View style={styles.exchangeTickerPill}>
            <Text style={styles.exchangeTickerLabel}>MARKET</Text>
          </View>
        </View>
        <View style={styles.exchangeBars}>
          <View style={[styles.exchangeBar, styles.exchangeBarShort]} />
          <View style={[styles.exchangeBar, styles.exchangeBarTall]} />
          <View style={[styles.exchangeBar, styles.exchangeBarMid]} />
          <View style={[styles.exchangeBar, styles.exchangeBarTall]} />
        </View>
        <View style={styles.exchangeGraph}>
          <View style={[styles.exchangeNode, styles.exchangeNodeOne]} />
          <View style={[styles.exchangeSegment, styles.exchangeSegmentOne]} />
          <View style={[styles.exchangeNode, styles.exchangeNodeTwo]} />
          <View style={[styles.exchangeSegment, styles.exchangeSegmentTwo]} />
          <View style={[styles.exchangeNode, styles.exchangeNodeThree]} />
          <View style={[styles.exchangeSegment, styles.exchangeSegmentThree]} />
          <View style={[styles.exchangeNode, styles.exchangeNodeFour]} />
        </View>
      </View>
      <View style={styles.phoneCard}>
        <View style={styles.phoneNotch} />
        <View style={styles.phoneChart}>
          <View style={[styles.phoneChartBar, styles.phoneChartBarShort]} />
          <View style={[styles.phoneChartBar, styles.phoneChartBarTall]} />
          <View style={[styles.phoneChartBar, styles.phoneChartBarMid]} />
        </View>
      </View>
      <View style={styles.showcaseFloor} />
      <View style={[styles.coin, styles.coinLeft]} />
      <View style={[styles.coin, styles.coinRight]} />
      <HeroBuddy
        accessoryColor="#3B82F6"
        hairColor="#4B5563"
        shirtColor="#F8FAFF"
        skinColor="#FFD7C7"
        accessoryType="tie"
        bodyVariant="rounded"
        hairVariant="parted"
        size="sm"
        style={styles.buddyLeft}
      />
      <HeroBuddy
        accessoryColor="#F59E0B"
        hairColor="#1F2937"
        shirtColor="#DCE8FF"
        skinColor="#FFD7C7"
        accessoryType="lanyard"
        bodyVariant="boxy"
        hairVariant="bowl"
        showGlasses
        size="lg"
        style={styles.buddyCenter}
      />
      <HeroBuddy
        accessoryColor="#16A34A"
        hairColor="#374151"
        shirtColor="#E6F4EA"
        skinColor="#FFD7C7"
        accessoryType="card"
        bodyVariant="tapered"
        hairVariant="bob"
        size="md"
        style={styles.buddyRight}
      />
    </View>
  );
}

function HeroBuddy({
  style,
  shirtColor,
  accessoryColor,
  skinColor,
  hairColor,
  accessoryType,
  bodyVariant = 'rounded',
  hairVariant = 'bowl',
  showGlasses = false,
  size = 'md',
}: {
  style?: StyleProp<ViewStyle>;
  shirtColor: string;
  accessoryColor: string;
  skinColor: string;
  hairColor: string;
  accessoryType: 'tie' | 'lanyard' | 'card';
  bodyVariant?: 'rounded' | 'boxy' | 'tapered';
  hairVariant?: 'bowl' | 'parted' | 'bob';
  showGlasses?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <View
      style={[
        styles.buddy,
        size === 'sm' && styles.buddySmall,
        size === 'lg' && styles.buddyLarge,
        style,
      ]}
    >
      <View style={styles.buddyShadow} />
      <View
        style={[
          styles.buddyBody,
          bodyVariant === 'boxy' && styles.buddyBodyBoxy,
          bodyVariant === 'tapered' && styles.buddyBodyTapered,
          size === 'sm' && styles.buddyBodySmall,
          size === 'lg' && styles.buddyBodyLarge,
          { backgroundColor: shirtColor },
        ]}
      >
        <View style={styles.buddyBodyShade} />
        <View style={styles.buddyBodyHighlight} />
        <View style={[styles.buddyAccessoryBase, buddyAccessoryStyles[accessoryType]]}>
          <View
            style={[
              styles.buddyAccessory,
              buddyAccessoryColorStyles[accessoryType],
              { backgroundColor: accessoryColor },
            ]}
          />
        </View>
      </View>
      <View style={[styles.buddyNeck, size === 'lg' && styles.buddyNeckLarge, { backgroundColor: skinColor }]} />
      <View
        style={[
          styles.buddyHead,
          size === 'sm' && styles.buddyHeadSmall,
          size === 'lg' && styles.buddyHeadLarge,
          { backgroundColor: skinColor },
        ]}
      >
        <View style={styles.buddyHeadHighlight} />
        <View
          style={[
            styles.buddyHair,
            hairVariant === 'parted' && styles.buddyHairParted,
            hairVariant === 'bob' && styles.buddyHairBob,
            { backgroundColor: hairColor },
          ]}
        />
        {showGlasses ? (
          <View style={styles.buddyGlasses}>
            <View style={styles.buddyGlassLens} />
            <View style={styles.buddyGlassBridge} />
            <View style={styles.buddyGlassLens} />
          </View>
        ) : null}
        <View style={styles.buddyFace}>
          <View style={styles.buddyEye} />
          <View style={styles.buddyEye} />
        </View>
        <View style={styles.buddyMouth} />
      </View>
      <View
        style={[
          styles.buddyArm,
          styles.buddyArmLeft,
          bodyVariant === 'boxy' && styles.buddyArmLeftRaised,
          bodyVariant === 'tapered' && styles.buddyArmLeftCalm,
          { backgroundColor: shirtColor },
        ]}
      />
      <View
        style={[
          styles.buddyArm,
          styles.buddyArmRight,
          bodyVariant === 'rounded' && styles.buddyArmRightCheer,
          bodyVariant === 'tapered' && styles.buddyArmRightOpen,
          { backgroundColor: shirtColor },
        ]}
      />
    </View>
  );
}

const buddyAccessoryStyles = StyleSheet.create({
  tie: {
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  lanyard: {
    justifyContent: 'center',
  },
  card: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 7,
  },
});

const buddyAccessoryColorStyles = StyleSheet.create({
  tie: {
    width: 8,
    height: 18,
    borderRadius: 999,
  },
  lanyard: {
    width: 10,
    height: 18,
    borderRadius: 999,
  },
  card: {
    width: 12,
    height: 14,
    borderRadius: 5,
  },
});

export function AuthField({ label, helper, style, ...props }: AuthFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={tokens.colors.inkMute}
        style={[styles.input, style]}
        {...props}
      />
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
    </View>
  );
}

export function AuthNotice({ tone = 'default', children }: AuthNoticeProps) {
  return <View style={[styles.notice, noticeToneStyles[tone]]}>{children}</View>;
}

export function AuthNoticeText({ children }: { children: ReactNode }) {
  return <Text style={styles.noticeText}>{children}</Text>;
}

export function AuthTextLink({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.textLink}>
      <Text style={styles.textLinkLabel}>{label}</Text>
    </Pressable>
  );
}

const noticeToneStyles = StyleSheet.create({
  default: {
    backgroundColor: tokens.colors.surfaceMuted,
  },
  positive: {
    backgroundColor: tokens.colors.positiveSoft,
  },
  danger: {
    backgroundColor: tokens.colors.dangerSoft,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: tokens.colors.canvas,
  },
  scrollContent: {
    flexGrow: 1,
  },
  shell: {
    width: '100%',
    alignSelf: 'center',
    gap: 18,
  },
  glowTop: {
    position: 'absolute',
    top: 0,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 90,
    left: -70,
    width: 170,
    height: 170,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 110, 0.10)',
  },
  heroCard: {
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    padding: 24,
    gap: 18,
    ...tokens.shadow,
  },
  heroCardCompact: {
    padding: 20,
  },
  heroCardCompactMode: {
    borderRadius: tokens.radius.lg,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    ...tokens.shadow,
  },
  heroCardCompactFullBleed: {
    paddingHorizontal: 12,
    paddingTop: 18,
    paddingBottom: 14,
  },
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  compactHeroLayout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  defaultHeroLayout: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 14,
  },
  compactHeroLayoutStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 12,
  },
  compactHeroLayoutNarrow: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  compactCopyArea: {
    flex: 1,
    gap: 10,
  },
  defaultCopyArea: {
    gap: 14,
  },
  compactGraphicArea: {
    width: 132,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  compactGraphicAreaStacked: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    marginHorizontal: -18,
    transform: [{ translateX: 12 }],
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkCompact: {
    width: 46,
    height: 46,
    borderRadius: 16,
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 28,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  brandMarkTextCompact: {
    fontSize: 22,
  },
  brandMeta: {
    gap: 4,
  },
  badge: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  brandName: {
    fontSize: 22,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  brandNameCompact: {
    fontSize: 18,
  },
  copyBlock: {
    gap: 10,
    flexShrink: 1,
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  heroTitleCompact: {
    fontSize: 27,
    lineHeight: 33,
  },
  heroTitleTight: {
    fontSize: 25,
    lineHeight: 31,
  },
  heroTitleStackedCompact: {
    fontSize: 22,
    lineHeight: 28,
  },
  heroTitleDefaultCompact: {
    fontSize: 24,
    lineHeight: 31,
  },
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  heroSubtitleTight: {
    fontSize: 14,
    lineHeight: 21,
  },
  heroSubtitleStackedCompact: {
    fontSize: 13,
    lineHeight: 20,
  },
  heroSubtitleDefaultCompact: {
    fontSize: 14,
    lineHeight: 21,
  },
  signalRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  signalPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.brandSoft,
    maxWidth: '100%',
  },
  signalLabel: {
    color: tokens.colors.brandStrong,
    fontSize: 12,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
    flexShrink: 1,
  },
  showcase: {
    width: 208,
    height: 148,
    position: 'relative',
  },
  showcaseGlow: {
    position: 'absolute',
    left: 48,
    top: 10,
    width: 112,
    height: 88,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  exchangeBoard: {
    position: 'absolute',
    left: 41,
    top: 14,
    width: 126,
    height: 86,
    borderRadius: 24,
    backgroundColor: 'rgba(225, 235, 252, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(191, 219, 254, 0.9)',
    paddingHorizontal: 12,
    paddingTop: 10,
    shadowColor: '#93C5FD',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  exchangeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  exchangeHeaderDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  exchangeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
  },
  exchangeDotBlue: {
    backgroundColor: '#60A5FA',
  },
  exchangeDotMint: {
    backgroundColor: '#5EEAD4',
  },
  exchangeDotAmber: {
    backgroundColor: '#FCD34D',
  },
  exchangeTickerPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.75)',
  },
  exchangeTickerLabel: {
    color: tokens.colors.brandStrong,
    fontSize: 8,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  exchangeBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
    height: 22,
    marginBottom: 8,
  },
  exchangeBar: {
    width: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.22)',
  },
  exchangeBarShort: {
    height: 8,
  },
  exchangeBarMid: {
    height: 14,
  },
  exchangeBarTall: {
    height: 20,
  },
  exchangeGraph: {
    height: 20,
    position: 'relative',
  },
  exchangeNode: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#2563EB',
    shadowColor: '#60A5FA',
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  exchangeNodeOne: {
    left: 0,
    bottom: 4,
  },
  exchangeNodeTwo: {
    left: 28,
    bottom: 10,
  },
  exchangeNodeThree: {
    left: 54,
    bottom: 7,
  },
  exchangeNodeFour: {
    right: 2,
    bottom: 14,
  },
  exchangeSegment: {
    position: 'absolute',
    height: 3,
    borderRadius: 999,
    backgroundColor: '#60A5FA',
  },
  exchangeSegmentOne: {
    left: 4,
    bottom: 8,
    width: 28,
    transform: [{ rotate: '-12deg' }],
  },
  exchangeSegmentTwo: {
    left: 32,
    bottom: 13,
    width: 24,
    transform: [{ rotate: '8deg' }],
  },
  exchangeSegmentThree: {
    left: 58,
    bottom: 10,
    width: 28,
    transform: [{ rotate: '-18deg' }],
  },
  phoneCard: {
    position: 'absolute',
    left: 30,
    top: 28,
    width: 48,
    height: 70,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.95)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    alignItems: 'center',
    paddingTop: 8,
    transform: [{ rotate: '-10deg' }],
  },
  phoneNotch: {
    width: 18,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
    marginBottom: 8,
  },
  phoneChart: {
    width: 24,
    height: 28,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  phoneChartBar: {
    width: 6,
    borderRadius: 999,
    backgroundColor: '#93C5FD',
  },
  phoneChartBarShort: {
    height: 8,
  },
  phoneChartBarMid: {
    height: 15,
  },
  phoneChartBarTall: {
    height: 20,
  },
  showcaseFloor: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 10,
    height: 24,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
  },
  coin: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 999,
    backgroundColor: '#FCD34D',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  coinLeft: {
    left: 34,
    top: 16,
  },
  coinRight: {
    right: 34,
    top: 16,
  },
  buddy: {
    position: 'absolute',
    bottom: 16,
    width: 44,
    alignItems: 'center',
  },
  buddySmall: {
    width: 40,
  },
  buddyLarge: {
    width: 48,
  },
  buddyLeft: {
    left: 38,
    transform: [{ rotate: '-9deg' }],
  },
  buddyCenter: {
    left: 80,
    zIndex: 2,
  },
  buddyRight: {
    left: 128,
    transform: [{ rotate: '8deg' }],
  },
  buddyShadow: {
    position: 'absolute',
    bottom: -4,
    width: 38,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.12)',
  },
  buddyBody: {
    width: 36,
    height: 36,
    borderRadius: 14,
    marginTop: 26,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  buddyBodySmall: {
    width: 34,
    height: 34,
    borderRadius: 13,
  },
  buddyBodyLarge: {
    width: 40,
    height: 40,
    borderRadius: 15,
  },
  buddyBodyBoxy: {
    borderRadius: 12,
  },
  buddyBodyTapered: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 18,
  },
  buddyBodyShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.05)',
  },
  buddyBodyHighlight: {
    position: 'absolute',
    top: 2,
    left: 4,
    width: 16,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.45)',
  },
  buddyAccessoryBase: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  buddyAccessory: {
    opacity: 0.95,
  },
  buddyNeck: {
    position: 'absolute',
    top: 24,
    width: 10,
    height: 10,
    borderRadius: 999,
  },
  buddyNeckLarge: {
    top: 26,
  },
  buddyHead: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 32,
    borderRadius: 999,
    alignItems: 'center',
    paddingTop: 7,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buddyHeadSmall: {
    width: 30,
    height: 30,
  },
  buddyHeadLarge: {
    width: 34,
    height: 34,
  },
  buddyHeadHighlight: {
    position: 'absolute',
    top: 3,
    left: 5,
    width: 14,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  buddyHair: {
    position: 'absolute',
    top: 0,
    left: 2,
    right: 2,
    height: 13,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 12,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
  },
  buddyHairParted: {
    left: 1,
    right: 1,
    height: 12,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 8,
  },
  buddyHairBob: {
    left: 0,
    right: 0,
    height: 14,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  buddyGlasses: {
    position: 'absolute',
    top: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  buddyGlassLens: {
    width: 7,
    height: 5,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(17, 24, 39, 0.45)',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  buddyGlassBridge: {
    width: 4,
    height: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
  },
  buddyFace: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 5,
  },
  buddyEye: {
    width: 3,
    height: 3,
    borderRadius: 999,
    backgroundColor: '#111827',
  },
  buddyMouth: {
    marginTop: 5,
    width: 9,
    height: 4,
    borderBottomLeftRadius: 999,
    borderBottomRightRadius: 999,
    backgroundColor: 'rgba(239, 68, 68, 0.55)',
  },
  buddyArm: {
    position: 'absolute',
    top: 34,
    width: 10,
    height: 28,
    borderRadius: 999,
  },
  buddyArmLeft: {
    left: 4,
    transform: [{ rotate: '-34deg' }],
  },
  buddyArmRight: {
    right: 4,
    transform: [{ rotate: '34deg' }],
  },
  buddyArmLeftRaised: {
    top: 30,
    transform: [{ rotate: '-52deg' }],
  },
  buddyArmLeftCalm: {
    top: 36,
    transform: [{ rotate: '-18deg' }],
  },
  buddyArmRightCheer: {
    top: 30,
    transform: [{ rotate: '52deg' }],
  },
  buddyArmRightOpen: {
    top: 32,
    transform: [{ rotate: '18deg' }],
  },
  formCard: {
    borderRadius: tokens.radius.md,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    padding: 22,
    gap: 16,
    ...tokens.shadow,
  },
  formCardCompact: {
    padding: 18,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 13,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  input: {
    minHeight: 58,
    backgroundColor: tokens.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    lineHeight: 22,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  fieldHelper: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  notice: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  textLink: {
    paddingVertical: 4,
  },
  textLinkLabel: {
    color: tokens.colors.brandStrong,
    fontSize: 14,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
});
