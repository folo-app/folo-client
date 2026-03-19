import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

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
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screen}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shell}>
          <View style={styles.glowTop} />
          <View style={styles.glowBottom} />

          <View style={styles.heroCard}>
            <View style={styles.brandRow}>
              <View style={styles.brandMark}>
                <Text style={styles.brandMarkText}>Fo</Text>
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.badge}>{badge}</Text>
                <Text style={styles.heroTitle}>{title}</Text>
                <Text style={styles.heroSubtitle}>{subtitle}</Text>
              </View>
            </View>

            <View style={styles.signalRow}>
              <View style={styles.signalPill}>
                <Text style={styles.signalLabel}>친구와 함께 남기는 투자 기록</Text>
              </View>
              <View style={styles.signalPill}>
                <Text style={styles.signalLabel}>인증 후 바로 메인 앱 진입</Text>
              </View>
            </View>
          </View>

          <View style={styles.formCard}>{children}</View>

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

export function AuthNotice({
  tone = 'default',
  children,
}: AuthNoticeProps) {
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
    justifyContent: 'center',
    paddingVertical: 24,
  },
  shell: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: 20,
    gap: 18,
  },
  glowTop: {
    position: 'absolute',
    top: -70,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: 'rgba(37, 99, 235, 0.13)',
  },
  glowBottom: {
    position: 'absolute',
    bottom: 70,
    left: -60,
    width: 150,
    height: 150,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 118, 110, 0.10)',
  },
  heroCard: {
    borderRadius: tokens.radius.lg,
    backgroundColor: tokens.colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    padding: 22,
    gap: 20,
    ...tokens.shadow,
  },
  brandRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'center',
  },
  brandMark: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: tokens.colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandMarkText: {
    color: tokens.colors.surface,
    fontSize: 30,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
  brandCopy: {
    flex: 1,
    gap: 6,
  },
  badge: {
    fontSize: 12,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.72)',
    padding: 22,
    gap: 16,
    ...tokens.shadow,
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
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.96)',
    backgroundColor: tokens.colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.body,
  },
  fieldHelper: {
    fontSize: 12,
    lineHeight: 18,
    color: tokens.colors.inkSoft,
    fontFamily: tokens.typography.body,
  },
  notice: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeText: {
    color: tokens.colors.navy,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
  },
  textLink: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  textLinkLabel: {
    color: tokens.colors.brandStrong,
    fontSize: 14,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
});
