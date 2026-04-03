import { Share } from 'react-native';

import { getUserProfileDeepLink } from '../navigation/deepLinks';

type ShareProfileOptions = {
  userId: number;
  nickname: string;
};

export function buildProfileShareMessage({
  userId,
  nickname,
}: ShareProfileOptions) {
  const deepLink = getUserProfileDeepLink(userId, 'profile-share');

  return [
    `${nickname}님의 Folo 프로필을 공유합니다.`,
    '앱이 있으면 바로 열리고, 아직 없으면 Folo에서 닉네임으로 찾아볼 수 있습니다.',
    deepLink,
  ].join('\n');
}

export async function shareProfile(options: ShareProfileOptions) {
  return Share.share({
    message: buildProfileShareMessage(options),
  });
}
