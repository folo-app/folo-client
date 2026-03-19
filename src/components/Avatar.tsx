import { Image, StyleSheet, Text, View } from 'react-native';

import { tokens } from '../theme/tokens';

type AvatarProps = {
  name: string;
  imageUrl?: string | null;
  size?: number;
  backgroundColor?: string;
};

function initialsFor(name: string) {
  const normalized = name.trim();

  if (!normalized) {
    return '?';
  }

  const characters = normalized.replace(/[^A-Za-z0-9가-힣]/g, '');
  return (characters.slice(0, 2) || normalized.slice(0, 1)).toUpperCase();
}

export function Avatar({
  name,
  imageUrl,
  size = 56,
  backgroundColor = tokens.colors.surfaceMuted,
}: AvatarProps) {
  const radius = Math.round(size / 3);
  const textSize = Math.max(16, Math.round(size * 0.38));

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
        },
      ]}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: size, height: size, borderRadius: radius }}
        />
      ) : (
        <Text style={[styles.label, { fontSize: textSize }]}>{initialsFor(name)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
  },
});
