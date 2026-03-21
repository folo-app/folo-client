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
            ]}
          >
            <View
              style={[
                heroVariant === 'compact' ? styles.compactHeroLayout : styles.brandBar,
                stackedCompactHero && styles.compactHeroLayoutStacked,
                narrow && heroVariant === 'compact' && styles.compactHeroLayoutNarrow,
              ]}
            >
              <View
                style={[
                  heroVariant === 'compact' ? styles.compactCopyArea : styles.brandBar,
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
                    ]}
                  >
                    {title}
                  </Text>
                  <Text
                    style={[
                      styles.heroSubtitle,
                      heroVariant === 'compact' && styles.heroSubtitleTight,
                      stackedCompactHero && styles.heroSubtitleStackedCompact,
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
      <View style={styles.showcaseFloor} />
      <View style={[styles.coin, styles.coinLeft]} />
      <View style={[styles.coin, styles.coinRight]} />
      <HeroBuddy
        accessoryColor="#3B82F6"
        hairColor="#4B5563"
        shirtColor="#F8FAFF"
        skinColor="#FFD7C7"
        style={styles.buddyLeft}
      />
      <HeroBuddy
        accessoryColor="#F59E0B"
        hairColor="#1F2937"
        shirtColor="#DCE8FF"
        skinColor="#FFD7C7"
        style={styles.buddyCenter}
      />
      <HeroBuddy
        accessoryColor="#16A34A"
        hairColor="#374151"
        shirtColor="#E6F4EA"
        skinColor="#FFD7C7"
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
}: {
  style?: StyleProp<ViewStyle>;
  shirtColor: string;
  accessoryColor: string;
  skinColor: string;
  hairColor: string;
}) {
  return (
    <View style={[styles.buddy, style]}>
      <View style={styles.buddyShadow} />
      <View style={[styles.buddyBody, { backgroundColor: shirtColor }]}>
        <View style={[styles.buddyAccent, { backgroundColor: accessoryColor }]} />
      </View>
      <View style={[styles.buddyNeck, { backgroundColor: skinColor }]} />
      <View style={[styles.buddyHead, { backgroundColor: skinColor }]}>
        <View style={[styles.buddyHair, { backgroundColor: hairColor }]} />
        <View style={styles.buddyFace}>
          <View style={styles.buddyEye} />
          <View style={styles.buddyEye} />
        </View>
        <View style={styles.buddyMouth} />
      </View>
      <View style={[styles.buddyArm, styles.buddyArmLeft, { backgroundColor: shirtColor }]} />
      <View style={[styles.buddyArm, styles.buddyArmRight, { backgroundColor: shirtColor }]} />
    </View>
  );
}

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
  compactGraphicArea: {
    width: 132,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  compactGraphicAreaStacked: {
    width: '100%',
    alignItems: 'flex-end',
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
  },
  signalLabel: {
    color: tokens.colors.brandStrong,
    fontSize: 12,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  showcase: {
    width: 132,
    height: 112,
    position: 'relative',
  },
  showcaseGlow: {
    position: 'absolute',
    right: 4,
    top: 8,
    width: 96,
    height: 72,
    borderRadius: 999,
    backgroundColor: 'rgba(59, 130, 246, 0.10)',
  },
  showcaseFloor: {
    position: 'absolute',
    left: 10,
    right: 8,
    bottom: 6,
    height: 18,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.10)',
  },
  coin: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 999,
    backgroundColor: '#FCD34D',
    shadowColor: '#F59E0B',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  coinLeft: {
    left: 18,
    top: 14,
  },
  coinRight: {
    right: 18,
    top: 4,
  },
  buddy: {
    position: 'absolute',
    bottom: 12,
    width: 44,
    alignItems: 'center',
  },
  buddyLeft: {
    left: 2,
    transform: [{ rotate: '-8deg' }],
  },
  buddyCenter: {
    left: 44,
    zIndex: 2,
  },
  buddyRight: {
    right: 0,
    transform: [{ rotate: '8deg' }],
  },
  buddyShadow: {
    position: 'absolute',
    bottom: -2,
    width: 34,
    height: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.10)',
  },
  buddyBody: {
    width: 36,
    height: 36,
    borderRadius: 14,
    marginTop: 26,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
    shadowColor: '#0F172A',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buddyAccent: {
    width: 8,
    height: 18,
    borderRadius: 999,
    opacity: 0.9,
  },
  buddyNeck: {
    position: 'absolute',
    top: 24,
    width: 10,
    height: 10,
    borderRadius: 999,
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
