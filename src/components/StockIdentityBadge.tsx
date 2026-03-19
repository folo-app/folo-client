import { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import type { MarketType } from '../api/contracts';
import { tokens } from '../theme/tokens';

type StockIdentityBadgeProps = {
  ticker: string;
  name: string;
  market: MarketType;
  logoUrl?: string | null;
  size?: number;
};

const krPalette = ['#E0ECFF', '#D9F7E9', '#FFE6D4', '#FCE1EC', '#ECE6FF'];
const usPalette = ['#DBEAFE', '#E0F2FE', '#F3E8FF', '#FCE7F3', '#E2E8F0'];
const inkPalette = ['#1D4ED8', '#0F766E', '#C2410C', '#BE185D', '#5B21B6'];

function getInitials(name: string, ticker: string) {
  const normalizedName = name.trim().replace(/[^A-Za-z0-9가-힣]/g, '');
  if (normalizedName.length >= 2) {
    return normalizedName.slice(0, 2).toUpperCase();
  }

  if (normalizedName.length === 1) {
    return normalizedName.toUpperCase();
  }

  return ticker.slice(0, 2).toUpperCase();
}

function seedFor(value: string) {
  return value.split('').reduce((sum, character) => sum + character.charCodeAt(0), 0);
}

export function StockIdentityBadge({
  ticker,
  name,
  market,
  logoUrl,
  size = 74,
}: StockIdentityBadgeProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const palette = market === 'KRX' ? krPalette : usPalette;
  const seed = useMemo(() => seedFor(`${market}:${ticker}:${name}`), [market, name, ticker]);
  const backgroundColor = palette[seed % palette.length];
  const accentColor = inkPalette[seed % inkPalette.length];
  const initials = getInitials(name, ticker);
  const marketLabel = market === 'KRX' ? 'KR' : 'US';
  const resolvedLogo = logoUrl ?? null;

  if (resolvedLogo && !imageFailed) {
    return (
      <View
        style={[
          styles.shell,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
        ]}
      >
        <Image
          resizeMode="cover"
          source={{ uri: resolvedLogo }}
          style={[
            styles.logoImage,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
            },
          ]}
          onError={() => setImageFailed(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.shell,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor,
          borderColor: 'rgba(148, 163, 184, 0.18)',
        },
      ]}
    >
      <View
        style={[
          styles.placeholderInner,
          {
            borderRadius: (size - 8) / 2,
            borderColor: 'rgba(255, 255, 255, 0.72)',
          },
        ]}
      >
        <Text
          style={[
            styles.initials,
            {
              color: accentColor,
              fontSize: size * 0.28,
            },
          ]}
        >
          {initials}
        </Text>
      </View>
      <View style={styles.marketPill}>
        <Text style={styles.marketPillText}>{marketLabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    position: 'relative',
  },
  logoImage: {
    backgroundColor: '#FFFFFF',
  },
  placeholderInner: {
    width: '100%',
    height: '100%',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.32)',
  },
  initials: {
    fontFamily: tokens.typography.heading,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  marketPill: {
    position: 'absolute',
    bottom: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
  },
  marketPillText: {
    color: tokens.colors.surface,
    fontSize: 10,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
});
