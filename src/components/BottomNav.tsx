import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tokens } from '../theme/tokens';
import type { TabKey } from '../types/navigation';

const items: Array<{ key: TabKey; label: string }> = [
  { key: 'home', label: '홈' },
  { key: 'feed', label: '피드' },
  { key: 'add', label: '추가' },
  { key: 'portfolio', label: '포트폴리오' },
  { key: 'profile', label: '프로필' },
];

export function BottomNav({
  activeTab,
  onChange,
}: {
  activeTab: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
      <View style={styles.bar}>
        {items.map((item) => {
          const isActive = item.key === activeTab;
          const isAdd = item.key === 'add';

          return (
            <Pressable
              key={item.key}
              accessibilityRole="button"
              onPress={() => onChange(item.key)}
              style={({ pressed }) => [
                styles.item,
                isAdd && styles.addItem,
                pressed && styles.itemPressed,
              ]}
            >
              {isAdd ? (
                <View style={[styles.fab, isActive && styles.fabActive]}>
                  <Ionicons
                    name="add"
                    size={20}
                    color={isActive ? tokens.colors.brandStrong : tokens.colors.inkSoft}
                  />
                </View>
              ) : (
                <>
                  {renderIcon(item.key as Exclude<TabKey, 'add'>, isActive)}
                  <Text style={[styles.label, isActive && styles.labelActive]}>{item.label}</Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function renderIcon(tab: Exclude<TabKey, 'add'>, isActive: boolean) {
  const color = isActive ? tokens.colors.navy : tokens.colors.inkMute;
  switch (tab) {
    case 'home':
      return <Feather color={color} name="home" size={18} />;
    case 'feed':
      return <MaterialCommunityIcons color={color} name="format-list-bulleted" size={20} />;
    case 'portfolio':
      return <Ionicons color={color} name="pie-chart-outline" size={20} />;
    case 'profile':
      return <Ionicons color={color} name="person-outline" size={20} />;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'rgba(244, 247, 251, 0.92)',
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
  },
  bar: {
    width: '100%',
    maxWidth: tokens.layout.maxWidth,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.8)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
    ...tokens.shadow,
  },
  item: {
    flex: 1,
    minHeight: 58,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  addItem: {
    marginTop: -10,
  },
  itemPressed: {
    opacity: 0.86,
  },
  label: {
    fontSize: 11,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  labelActive: {
    color: tokens.colors.navy,
  },
  fab: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(248, 250, 252, 0.98)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(214, 224, 234, 0.9)',
  },
  fabActive: {
    backgroundColor: 'rgba(229, 239, 252, 0.98)',
    borderColor: 'rgba(37, 99, 235, 0.18)',
  },
});
