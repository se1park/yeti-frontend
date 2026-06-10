import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { Avatar, Card, PrimaryButton, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function getUsername(friend) {
  return friend?.username || friend?.handle?.replace(/^@/, '') || friend?.raw?.username || 'user';
}

export function FriendProfileScreen({ apiError, friend, goBack, onChat }) {
  const username = getUsername(friend);
  const displayName = friend?.nickname || friend?.name || username;
  const statusMessage = friend?.statusMessage || friend?.message || '상태 메시지가 없습니다.';
  const profileImageUrl = friend?.profileImageUrl || friend?.profile_image_url || '';
  const avatarLabel = displayName.slice(0, 1).toUpperCase();

  return (
    <Screen left="‹" onBack={goBack} right="•••">
      <View style={styles.desktopGrid}>
        <Card style={styles.heroCard}>
          <View style={styles.profileCenter}>
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={styles.profileImage} />
            ) : (
              <Avatar label={avatarLabel} color={BLUE} size={86} />
            )}
            <Text style={styles.profileName}>{displayName}</Text>
            <Text style={styles.profileMeta}>@{username} · {friend?.status || '활동 중'}</Text>
            <Text style={styles.quote}>"{statusMessage}"</Text>
          </View>
          {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
          <View style={styles.statsRow}>
            <MiniStat value="-" label="함께한 약속" />
            <MiniStat value="-" label="친구된 지" />
            <MiniStat value="-" label="함께 한 채팅방" />
          </View>
          <View style={styles.actionRow}>
            <PrimaryButton onPress={() => onChat?.(friend)} style={styles.actionButton}>
              <View style={styles.buttonLabel}>
                <MessageCircle color="#ffffff" size={15} strokeWidth={2.4} />
                <Text style={styles.buttonLabelText}>채팅</Text>
              </View>
            </PrimaryButton>
          </View>
        </Card>
        <View style={styles.sideColumn}>
          <Text style={styles.section}>함께 예정된 일정</Text>
          <Card style={styles.formCard}>
            <InfoRow label="아직 예정된 일정이 없습니다" value="" />
          </Card>
        </View>
      </View>
    </Screen>
  );
}

function MiniStat({ value, label }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value, danger }) {
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, danger && styles.danger]}>{label}</Text>
      <Text style={[styles.infoValue, danger && styles.danger]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  actionButton: { flex: 1 },
  actionRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  buttonLabel: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  buttonLabelText: { color: '#ffffff', fontSize: 15, fontWeight: '900' },
  danger: { color: '#f04454' },
  errorText: { color: '#f04454', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  formCard: { paddingVertical: 0 },
  desktopGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 18 : 0,
  },
  heroCard: {
    flex: Platform.OS === 'web' ? 1.1 : undefined,
    minWidth: Platform.OS === 'web' ? 420 : undefined,
  },
  infoLabel: { color: INK, fontSize: 14, fontWeight: '800' },
  infoRow: { alignItems: 'center', borderBottomColor: LINE, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  infoValue: { color: MUTED, fontSize: 12, fontWeight: '800' },
  profileCenter: { alignItems: 'center', marginBottom: 18 },
  profileImage: { borderRadius: 43, height: 86, width: 86 },
  profileMeta: { color: MUTED, fontSize: 12, fontWeight: '800', marginTop: 4 },
  profileName: { color: INK, fontSize: 24, fontWeight: '900', marginTop: 14 },
  quote: { backgroundColor: '#ffffff', borderRadius: 14, color: MUTED, fontSize: 12, fontWeight: '800', marginTop: 12, overflow: 'hidden', paddingHorizontal: 14, paddingVertical: 10 },
  section: { color: MUTED, fontSize: 12, fontWeight: '900', marginBottom: 8, marginTop: 10 },
  stat: { alignItems: 'center', borderRightColor: LINE, borderRightWidth: 1, flex: 1, paddingVertical: 14 },
  statLabel: { color: MUTED, fontSize: 11, fontWeight: '800', marginTop: 4 },
  statValue: { color: INK, fontSize: 18, fontWeight: '900' },
  statsRow: { backgroundColor: '#ffffff', flexDirection: 'row', marginBottom: 12 },
  sideColumn: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 360 : undefined,
  },
});
