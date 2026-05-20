import { useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, MUTED } from '../data/yetiData';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}월 ${date.getDate()}일`;
}

function formatTime(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function normalizeParticipant(person, index) {
  return {
    id: person.userId || person.username || `${index}`,
    initial: (person.nickname || person.username || '?').slice(0, 1),
    name: person.nickname || person.username || '사용자',
    role: person.status || '',
    status: person.status || '대기',
    color: [INK, BLUE, '#0fbf73', '#f59e0b'][index % 4],
  };
}

export function ScheduleScreen({ apiError, goTo, goBack, onComplete, schedule }) {
  const [completeVisible, setCompleteVisible] = useState(false);
  const detail = schedule;
  const participantList = (detail?.participants || []).map(normalizeParticipant);
  const scheduleId = detail?.scheduleId || detail?.id;
  const isCompleted = Boolean(detail?.completed || detail?.status === 'COMPLETED');

  const finish = async () => {
    if (!scheduleId || isCompleted) return;
    await onComplete?.(scheduleId);
    setCompleteVisible(true);
  };

  return (
    <View style={styles.flex}>
      <Screen
        left="‹"
        onBack={goBack}
        right="···"
        bottom={detail ? (
          <View style={styles.bottomButtons}>
            <SecondaryButton onPress={() => goTo('scheduleEdit')}>새 일정</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={finish}>{isCompleted ? '완료됨' : '✓ 완료 처리'}</PrimaryButton>
          </View>
        ) : null}
      >
        {detail ? (
          <>
            <Pill tone="yellow">{detail.category || '일정'}</Pill>
            <Text style={styles.title}>{detail.title}</Text>
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
            <Text style={styles.infoStrong}>▣  {formatDate(detail.startAt)}</Text>
            <Text style={styles.info}>{formatTime(detail.startAt)} - {formatTime(detail.endAt)}</Text>
            <Text style={styles.infoStrong}>⌖  {detail.location || '-'}</Text>
            <Text style={styles.info}>{detail.description || '메모가 없습니다.'}</Text>
            <Text style={styles.privacy}>⊙ {detail.visibility || 'PRIVATE'}</Text>
            <Card style={styles.peopleCard}>
              <View style={styles.peopleHeader}>
                <Text style={styles.peopleTitle}>참여자 {participantList.length}</Text>
              </View>
              {participantList.length ? participantList.map((person) => (
                <View key={person.id} style={styles.personRow}>
                  <Avatar label={person.initial} color={person.color} />
                  <View style={styles.personText}>
                    <Text style={styles.personName}>{person.name}</Text>
                    <Text style={styles.personRole}>{person.role}</Text>
                  </View>
                  <Pill tone={person.status === 'ACCEPTED' ? 'green' : person.status === 'OWNER' ? 'gray' : 'blue'}>{person.status}</Pill>
                </View>
              )) : (
                <Text style={styles.emptyText}>참여자 정보가 없습니다.</Text>
              )}
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>선택된 일정이 없습니다</Text>
            <Text style={styles.emptyText}>백엔드에서 불러온 일정이 있으면 상세 화면에 표시됩니다.</Text>
          </Card>
        )}
      </Screen>
      <CompleteSheet title={detail?.title} visible={completeVisible} onClose={() => { setCompleteVisible(false); goTo('home'); }} />
    </View>
  );
}

function CompleteSheet({ title, visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.greenCircle}>
            <Text style={styles.greenCheck}>✓</Text>
          </View>
          <Text style={styles.sheetTitle}>완료 처리했어요</Text>
          <Text style={styles.sheetSub}>{title || '일정'}을 완료 처리했어요.</Text>
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
  errorText: {
    color: '#f04454',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
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
  bottomButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryGrow: {
    flex: 1.5,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  emptyTitle: {
    color: INK,
    fontSize: 15,
    fontWeight: '900',
  },
  emptyText: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 6,
    textAlign: 'center',
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
});
