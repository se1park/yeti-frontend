import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

export function ProfileScreen({ goTo }) {
  const [subscribeVisible, setSubscribeVisible] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen title="마이" right="설정">
        <Card style={styles.profile}>
          <Avatar label="YJ" color={BLUE} size={56} />
          <View style={styles.profileText}>
            <Text style={styles.name}>유진 <Text style={styles.handle}>@yujin</Text></Text>
            <Text style={styles.status}>약속을 한 번에 끝내고 싶다</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>

        <Card style={styles.premium}>
          <Pill>체험 중</Pill>
          <Text style={styles.premiumTitle}>프리미엄 체험 5일 남음</Text>
          <Text style={styles.premiumText}>AI 고도화, 그룹 즉시 적용, 학습 노트 요약을 계속 사용할 수 있어요.</Text>
          <Pressable onPress={() => setSubscribeVisible(true)} style={styles.whiteCta}>
            <Text style={styles.whiteCtaText}>연 30,000원으로 시작하기 ›</Text>
          </Pressable>
        </Card>

        <View style={styles.stats}>
          <Stat value="12" label="이번 달 일정" />
          <Stat value="8" label="친구" />
          <Stat value="24" label="학습 노트" />
        </View>

        <Text style={styles.sectionLabel}>계정</Text>
        <Card style={styles.menuCard}>
          <Menu label="프로필 편집" value="@yujin" onPress={() => goTo('profileEdit')} />
          <Menu label="알림 설정" value="15분 전" onPress={() => goTo('notificationSettings')} />
          <Menu label="공개 범위" value="친구 공개" onPress={() => goTo('privacySettings')} />
          <Menu label="테마" value="시스템" onPress={() => goTo('themeSettings')} />
          <Menu label="언어" value="한국어" onPress={() => goTo('languageSettings')} />
          <Menu label="도움말 · FAQ" value="" onPress={() => goTo('helpFaq')} />
          <Menu label="이용약관 · 개인정보" value="" onPress={() => goTo('termsPrivacy')} />
          <Menu label="학습 노트" value="24개" onPress={() => goTo('studyNote')} />
        </Card>
      </Screen>

      <SubscribeSheet visible={subscribeVisible} onClose={() => setSubscribeVisible(false)} />
    </View>
  );
}

function SubscribeSheet({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>프리미엄 구독</Text>
          <Text style={styles.sheetSub}>체험이 끝나기 전에 시작하면 첫 달 무료.</Text>
          <View style={styles.planSelected}>
            <View>
              <Text style={styles.planLabel}>연간 구독</Text>
              <Text style={styles.planPrice}>30,000원 <Text style={styles.planUnit}>/ 년</Text></Text>
              <Text style={styles.planSub}>월 2,500원 · 월간 대비 12,000원 저렴</Text>
            </View>
            <Text style={styles.selectedMark}>✓</Text>
          </View>
          <View style={styles.plan}>
            <View>
              <Text style={styles.planLabel}>월간 구독</Text>
              <Text style={styles.planPrice}>3,500원 <Text style={styles.planUnit}>/ 월</Text></Text>
            </View>
            <View style={styles.emptyCircle} />
          </View>
          <Card style={styles.features}>
            {['AI 자연어 입력 고도화', '그룹 일정 즉시 적용', '학습 노트 AI 3줄 요약', '반복 일정 고급 설정 + 전용 테마'].map((item) => (
              <Text key={item} style={styles.feature}>✓ {item}</Text>
            ))}
          </Card>
          <PrimaryButton onPress={onClose}>App Store로 결제 진행</PrimaryButton>
          <Text style={styles.cancelText}>언제든 해지 가능 · 만료일까지 프리미엄 유지</Text>
        </View>
      </View>
    </Modal>
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

function Menu({ label, value, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.menu}>
      <Text style={styles.menuLabel}>{label}</Text>
      <Text style={styles.menuValue}>{value} ›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profile: { alignItems: 'center', borderWidth: 0, flexDirection: 'row', gap: 14, shadowOpacity: 0 },
  profileText: { flex: 1 },
  name: { color: INK, fontSize: 18, fontWeight: '900' },
  handle: { color: MUTED, fontSize: 12, fontWeight: '800' },
  status: { color: MUTED, fontSize: 12, fontWeight: '700', marginTop: 4 },
  chevron: { color: MUTED, fontSize: 22 },
  premium: { backgroundColor: BLUE, borderWidth: 0, padding: 18 },
  premiumTitle: { color: '#ffffff', fontSize: 21, fontWeight: '900', marginTop: 10 },
  premiumText: { color: '#dce8ff', fontSize: 12, fontWeight: '700', lineHeight: 19, marginBottom: 16, marginTop: 8 },
  whiteCta: { alignItems: 'center', alignSelf: 'flex-start', backgroundColor: '#ffffff', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 10 },
  whiteCtaText: { color: BLUE, fontSize: 13, fontWeight: '900' },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stat: { alignItems: 'center', backgroundColor: '#ffffff', borderColor: LINE, borderRadius: 12, borderWidth: 1, flex: 1, paddingVertical: 14 },
  statValue: { color: INK, fontSize: 23, fontWeight: '900' },
  statLabel: { color: MUTED, fontSize: 10, fontWeight: '800', marginTop: 4 },
  sectionLabel: { color: MUTED, fontSize: 12, fontWeight: '900', marginBottom: 8 },
  menuCard: { paddingVertical: 0 },
  menu: { alignItems: 'center', borderBottomColor: LINE, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15 },
  menuLabel: { color: INK, fontSize: 14, fontWeight: '800' },
  menuValue: { color: MUTED, fontSize: 13, fontWeight: '700' },
  modalBackdrop: { backgroundColor: 'rgba(17, 24, 39, 0.48)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 30 },
  handle: { alignSelf: 'center', backgroundColor: '#d0d5dd', borderRadius: 2, height: 4, marginBottom: 16, width: 34 },
  sheetTitle: { color: INK, fontSize: 20, fontWeight: '900' },
  sheetSub: { color: MUTED, fontSize: 12, fontWeight: '700', marginBottom: 14, marginTop: 4 },
  planSelected: { alignItems: 'center', backgroundColor: '#e8f1ff', borderColor: BLUE, borderRadius: 10, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, padding: 13 },
  plan: { alignItems: 'center', borderColor: LINE, borderRadius: 10, borderWidth: 1, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, padding: 13 },
  planLabel: { color: MUTED, fontSize: 12, fontWeight: '900' },
  planPrice: { color: INK, fontSize: 19, fontWeight: '900', marginTop: 4 },
  planUnit: { fontSize: 12 },
  planSub: { color: MUTED, fontSize: 11, fontWeight: '700', marginTop: 3 },
  selectedMark: { backgroundColor: BLUE, borderRadius: 12, color: '#ffffff', fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 6, paddingVertical: 3 },
  emptyCircle: { borderColor: '#cbd5e1', borderRadius: 10, borderWidth: 1, height: 20, width: 20 },
  features: { backgroundColor: '#f8fafc', shadowOpacity: 0 },
  feature: { color: '#475467', fontSize: 12, fontWeight: '800', lineHeight: 23 },
  cancelText: { color: MUTED, fontSize: 11, fontWeight: '700', marginTop: 12, textAlign: 'center' },
});
