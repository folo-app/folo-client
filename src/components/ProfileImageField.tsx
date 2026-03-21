import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { foloApi } from '../api/services';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';
import { tokens } from '../theme/tokens';
import { Avatar } from './Avatar';

type ProfileImageFieldProps = {
  label: string;
  helper?: string;
  value: string | null;
  fallbackName: string;
  onChange: (value: string | null) => void;
};

export function ProfileImageField({
  label,
  helper,
  value,
  fallbackName,
  onChange,
}: ProfileImageFieldProps) {
  const { isCompact } = useResponsiveLayout();
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handlePickImage() {
    setUploading(true);
    setMessage(null);

    try {
      if (Platform.OS !== 'web') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          setMessage('사진 보관함 접근 권한이 필요합니다.');
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.82,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];
      const response = await foloApi.uploadProfileImage({
        uri: asset.uri,
        name: asset.fileName ?? `profile-${Date.now()}.jpg`,
        mimeType: asset.mimeType,
      });

      onChange(response.url);
      setMessage('프로필 이미지가 업로드되었습니다.');
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : '프로필 이미지 업로드에 실패했습니다.',
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.previewRow, isCompact && styles.previewRowCompact]}>
        <Avatar
          backgroundColor={tokens.colors.brandSoft}
          imageUrl={value}
          name={fallbackName}
          size={76}
        />
        <View style={styles.previewActions}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePickImage}
            style={({ pressed }) => [
              styles.actionButton,
              pressed && styles.actionButtonPressed,
            ]}
          >
            <Text style={styles.actionButtonLabel}>
              {uploading ? '업로드 중...' : value ? '다시 선택' : '갤러리에서 선택'}
            </Text>
          </Pressable>
          {value ? (
            <Pressable
              accessibilityRole="button"
              onPress={() => onChange(null)}
              style={({ pressed }) => [
                styles.textAction,
                pressed && styles.actionButtonPressed,
              ]}
            >
              <Text style={styles.textActionLabel}>사진 제거</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 10,
  },
  fieldLabel: {
    fontSize: 13,
    color: tokens.colors.navy,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  previewRowCompact: {
    alignItems: 'flex-start',
    flexDirection: 'column',
  },
  previewActions: {
    flex: 1,
    gap: 10,
  },
  actionButton: {
    alignSelf: 'flex-start',
    borderRadius: tokens.radius.pill,
    backgroundColor: tokens.colors.navy,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actionButtonLabel: {
    fontSize: 13,
    color: tokens.colors.surface,
    fontFamily: tokens.typography.heading,
    fontWeight: '700',
  },
  textAction: {
    alignSelf: 'flex-start',
  },
  textActionLabel: {
    fontSize: 12,
    color: tokens.colors.inkMute,
    fontFamily: tokens.typography.body,
  },
  fieldHelper: {
    color: tokens.colors.inkSoft,
    fontSize: 13,
    lineHeight: 20,
    fontFamily: tokens.typography.body,
  },
  message: {
    fontSize: 12,
    color: tokens.colors.brandStrong,
    fontFamily: tokens.typography.body,
  },
  actionButtonPressed: {
    opacity: 0.86,
  },
});
