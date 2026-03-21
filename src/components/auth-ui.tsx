import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  type TextInputProps,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';

type AuthScreenLayoutProps = {
  badge: string;
  title: string;
  subtitle: string;
  footer?: ReactNode;
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
  children,
}: AuthScreenLayoutProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const compact = width < 430;

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

          <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
            <View style={styles.brandBar}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>Fo</Text>
              </View>
              <View style={styles.brandMeta}>
                <Text style={styles.badge}>{badge}</Text>
                <Text style={styles.brandName}>FOLO</Text>
              </View>
            </View>

            <View style={styles.copyBlock}>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{title}</Text>
              <Text style={styles.heroSubtitle}>{subtitle}</Text>
            </View>

            <View style={styles.signalRow}>
              <View style={styles.signalPill}>
                <Text style={styles.signalLabel}>친구 피드와 포트폴리오를 한 흐름으로</Text>
              </View>
              <View style={styles.signalPill}>
                <Text style={styles.signalLabel}>인증 후 바로 포트폴리오 구성 시작</Text>
              </View>
            </View>
          </View>

          <View style={[styles.formCard, compact && styles.formCardCompact]}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  brandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  brandMark: {
    width: 64,
    height: 64,
    borderRadius: 22,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 28,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
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
  heroSubtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
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
