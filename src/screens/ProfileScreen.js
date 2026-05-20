import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Bell, BookOpen, ChevronRight, Globe2, HelpCircle, LockKeyhole, LogOut, Palette, UserRound } from 'lucide-react-native';
import { Avatar, Card, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function getEmailName(email) {
  return typeof email === 'string' && email.includes('@') ? email.split('@')[0] : '';
}

function getUsername(user) {
  return user.username || user.userName || user.preferred_username || user.handle || getEmailName(user.email) || user.userId || user.id || user.sub || '';
}

function getDisplayName(user) {
  return user.nickname || user.nickName || user.displayName || user.display_name || user.name || getUsername(user) || '사용자';
}

export function ProfileScreen({ authError, goTo, onLogout, session }) {
  const user = session?.user || {};
  const nickname = getDisplayName(user);
  const username = getUsername(user);
  const showHandle = username && username !== nickname;

  return (
    <View style={styles.flex}>
      <Screen noHeader tabInset>
        <View style={styles.profileHero}>
          <Avatar label={nickname.slice(0, 2).toUpperCase()} color={BLUE} size={64} />
          <View style={styles.profileText}>
            <Text numberOfLines={1} style={styles.name}>
              {nickname}
              {showHandle ? <Text style={styles.handle}> @{username}</Text> : null}
            </Text>
            <Text style={styles.status}>약속을 한 번에 끝내고 싶다</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>

        {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

        <View style={styles.summaryRow}>
          <Stat value="12" label="이번 달 일정" />
          <Stat value="8" label="친구" />
          <Stat value="24" label="학습 노트" />
        </View>

        <Text style={styles.sectionLabel}>환경설정</Text>
        <Card style={styles.menuCard}>
          <Menu Icon={UserRound} label="프로필 편집" value={username ? `@${username}` : ''} onPress={() => goTo('profileEdit')} />
          <Menu Icon={Bell} label="알림 설정" value="15분 전" onPress={() => goTo('notificationSettings')} />
          <Menu Icon={LockKeyhole} label="공개 범위" value="친구 공개" onPress={() => goTo('privacySettings')} />
          <Menu Icon={Palette} label="테마" value="시스템" onPress={() => goTo('themeSettings')} />
          <Menu Icon={Globe2} label="언어" value="한국어" onPress={() => goTo('languageSettings')} />
          <Menu Icon={HelpCircle} label="고객센터 · FAQ" value="" onPress={() => goTo('helpFaq')} />
          <Menu Icon={LockKeyhole} label="이용약관 · 개인정보" value="" onPress={() => goTo('termsPrivacy')} />
          <Menu Icon={BookOpen} label="학습 노트" value="24개" onPress={() => goTo('studyNote')} />
        </Card>

        <Pressable onPress={onLogout} style={styles.logoutBottom}>
          <LogOut color="#f04454" size={17} strokeWidth={2.5} />
          <Text style={styles.logoutBottomText}>로그아웃</Text>
        </Pressable>
      </Screen>
    </View>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Menu({ Icon, label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.menu, pressed && styles.pressed]}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIcon}>
          <Icon color={INK} size={17} strokeWidth={2.35} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value ? <Text numberOfLines={1} style={styles.menuValue}>{value}</Text> : null}
        <ChevronRight color="#a0a8b5" size={18} strokeWidth={2.35} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profileHero: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 14,
    marginBottom: 22,
    paddingTop: 8,
  },
  profileText: { flex: 1 },
  name: { color: INK, fontSize: 19, fontWeight: '900', lineHeight: 25 },
  handle: { color: MUTED, fontSize: 13, fontWeight: '800' },
  status: { color: '#7d8797', fontSize: 13, fontWeight: '800', marginTop: 5 },
  chevron: { color: '#98a2b3', fontSize: 28, fontWeight: '300' },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  stat: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 18,
  },
  statValue: { color: INK, fontSize: 25, fontWeight: '900', lineHeight: 30 },
  statLabel: { color: '#8a94a6', fontSize: 11, fontWeight: '900', marginTop: 6 },
  sectionLabel: { color: '#8a94a6', fontSize: 12, fontWeight: '900', marginBottom: 10 },
  menuCard: { paddingHorizontal: 18, paddingVertical: 0 },
  menu: {
    alignItems: 'center',
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
  },
  menuLeft: { alignItems: 'center', flexDirection: 'row', flex: 1, gap: 10 },
  menuIcon: { alignItems: 'center', backgroundColor: '#f3f5f8', borderRadius: 10, height: 32, justifyContent: 'center', width: 32 },
  menuLabel: { color: INK, fontSize: 15, fontWeight: '900' },
  menuRight: { alignItems: 'center', flexDirection: 'row', flexShrink: 1, gap: 6, marginLeft: 12 },
  menuValue: { color: '#8a94a6', flexShrink: 1, fontSize: 14, fontWeight: '800' },
  pressed: { opacity: 0.72 },
  errorText: { color: '#f04454', fontSize: 12, fontWeight: '800', marginBottom: 12 },
  logoutBottom: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#fff1f2',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginBottom: 8,
    marginTop: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoutBottomText: { color: '#f04454', fontSize: 13, fontWeight: '900' },
});
