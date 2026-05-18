import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, MUTED, participants } from '../data/yetiData';

export function ScheduleScreen({ goTo, goBack }) {
  const [completeVisible, setCompleteVisible] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen
        left="‹"
        onBack={goBack}
        right="⌁  ···"
        bottom={(
          <View style={styles.bottomButtons}>
            <SecondaryButton onPress={() => goTo('scheduleEdit')}>수정</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={() => setCompleteVisible(true)}>✓ 완료 처리</PrimaryButton>
          </View>
        )}
      >
        <Pill tone="yellow">약속</Pill>
        <Text style={styles.title}>북한산 등산</Text>
        <Text style={styles.infoStrong}>▣  5월 23일 (토)</Text>
        <Text style={styles.info}>오전 9:00 - 오후 1:00 · 4시간</Text>
        <Text style={styles.infoStrong}>⌖  우이동 등산로 입구</Text>
        <Text style={styles.info}>우이동역 2번 출구 앞에서 만나요. 등산화 꼭 챙기기!</Text>
        <Text style={styles.privacy}>⊙ 친구에게만 공개 · 제목·시간·장소 표시</Text>
        <Card style={styles.peopleCard}>
          <View style={styles.peopleHeader}>
            <Text style={styles.peopleTitle}>참여자 4</Text>
            <Text style={styles.invite}>+ 초대</Text>
          </View>
          {participants.map((person) => (
            <View key={person.name} style={styles.personRow}>
              <Avatar label={person.initial} color={person.color} />
              <View style={styles.personText}>
                <Text style={styles.personName}>{person.name}</Text>
                <Text style={styles.personRole}>{person.role}</Text>
              </View>
              <Pill tone={person.status === '시간 조율' ? 'blue' : person.status === '주최' ? 'gray' : 'green'}>{person.status}</Pill>
            </View>
          ))}
          <View style={styles.suggestBox}>
            <Text style={styles.suggestText}>5월 24일(일) 오전 9시 어때세요?</Text>
            <View style={styles.suggestButtons}>
              <SecondaryButton>거절</SecondaryButton>
              <PrimaryButton style={styles.primaryGrow}>제안 수락</PrimaryButton>
            </View>
          </View>
        </Card>
      </Screen>
      <CompleteSheet visible={completeVisible} onClose={() => { setCompleteVisible(false); goTo('home'); }} />
    </View>
  );
}

function CompleteSheet({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.greenCircle}>
            <Text style={styles.greenCheck}>✓</Text>
          </View>
          <Text style={styles.sheetTitle}>수고하셨어요!</Text>
          <Text style={styles.sheetSub}>북한산 등산을 완료 처리했어요.</Text>
          <View style={styles.recordCard}>
            <Pill>✦</Pill>
            <View style={styles.flex}>
              <Text style={styles.recordTitle}>오늘의 기록을 남겨볼까요?</Text>
              <Text style={styles.recordMeta}>등산 코스 · 함께 한 사람 · 사진</Text>
            </View>
            <Text style={styles.recordButton}>기록</Text>
          </View>
          <Text style={styles.moodTitle}>어땠어요?</Text>
          <View style={styles.moods}>
            {['🔥\n최고', '😊\n좋음', '😐\n보통', '😮‍💨\n힘듦'].map((mood, index) => (
              <Text key={mood} style={[styles.mood, index === 0 && styles.moodActive]}>{mood}</Text>
            ))}
          </View>
          <PrimaryButton onPress={onClose}>완료</PrimaryButton>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  title: {
    color: INK,
    fontSize: 25,
    fontWeight: '900',
    marginBottom: 14,
    marginTop: 12,
  },
  info: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 23,
  },
  infoStrong: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 24,
  },
  privacy: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 18,
    marginTop: 16,
  },
  peopleCard: {
    borderWidth: 0,
    shadowOpacity: 0,
  },
  peopleHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  peopleTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
  },
  invite: {
    color: BLUE,
    fontSize: 13,
    fontWeight: '900',
  },
  personRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 9,
  },
  personText: {
    flex: 1,
  },
  personName: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  personRole: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  suggestBox: {
    backgroundColor: '#d8f8f6',
    borderRadius: 12,
    marginLeft: 42,
    marginTop: 8,
    padding: 12,
  },
  suggestText: {
    color: '#0f766e',
    fontSize: 13,
    fontWeight: '900',
  },
  suggestButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryGrow: {
    flex: 1.5,
  },
  modalBackdrop: {
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 22,
    paddingBottom: 30,
  },
  handle: {
    alignSelf: 'center',
    backgroundColor: '#d0d5dd',
    borderRadius: 2,
    height: 4,
    marginBottom: 20,
    width: 34,
  },
  greenCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#dcfce7',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  greenCheck: {
    color: '#16a34a',
    fontSize: 26,
    fontWeight: '900',
  },
  sheetTitle: {
    color: INK,
    fontSize: 20,
    fontWeight: '900',
    marginTop: 16,
    textAlign: 'center',
  },
  sheetSub: {
    color: MUTED,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 6,
    textAlign: 'center',
  },
  recordCard: {
    alignItems: 'center',
    backgroundColor: '#e8f1ff',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: 13,
  },
  recordTitle: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
  },
  recordMeta: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  recordButton: {
    backgroundColor: BLUE,
    borderRadius: 8,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  moodTitle: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
  },
  moods: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  mood: {
    backgroundColor: '#f4f6f8',
    borderRadius: 9,
    color: INK,
    flex: 1,
    fontSize: 12,
    fontWeight: '900',
    lineHeight: 20,
    overflow: 'hidden',
    paddingVertical: 8,
    textAlign: 'center',
  },
  moodActive: {
    borderColor: BLUE,
    borderWidth: 1.5,
    color: BLUE,
  },
});
