import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function normalizeStatus(value) {
  return String(value || 'PENDING').toUpperCase();
}

export function NotificationsScreen({ apiBusy, apiError, goBack, invitations = [], onInvitationAction }) {
  const items = [
    ['학습이 끝났어요. 정리할 시간!', '영어 회화 스터디 · 카페 라운지에서 1시간 30분 집중', '12분', '#fdf4ff'],
    ['김지민', '내일 회의 자료 미리 보내드릴게요!', '34분', '#ecfeff'],
    ['15분 후 시작', '헬스 · 하체 데이 · 강남 핏니스에서', '1시간', '#eff6ff'],
    ['운동 일정을 완료 처리했어요', '저녁 러닝 · 5km · 28분 40초', '어제', '#ecfdf5'],
    ['한지원님이 친구가 되었어요', '@jiwon · 함께 약속을 잡아보세요', '어제', '#f8fafc'],
    ['새 기능이 추가됐어요', 'AI 일정 정리와 친구 초대 흐름이 더 자연스러워졌어요.', '월', '#fff7ed'],
  ];

  return (
    <Screen left="‹" onBack={goBack} title="알림" right="전체 읽음">
      <View style={styles.segment}>
        {['전체', '일정', '채팅', '친구', '시스템'].map((item, index) => (
          <Text key={item} style={[styles.segmentItem, index === 0 && styles.segmentActive]}>{item}</Text>
        ))}
      </View>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
      <Text style={styles.groupLabel}>일정 초대</Text>
      {invitations.length ? invitations.map((invitation) => (
        <InvitationNotice
          busy={apiBusy}
          invitation={invitation}
          key={invitation.id || invitation.participantId || invitation.scheduleId}
          onAction={onInvitationAction}
        />
      )) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>받은 일정 초대가 없습니다</Text>
          <Text style={styles.emptyText}>친구가 함께 일정을 만들면 여기에서 수락하거나 거절할 수 있어요.</Text>
        </Card>
      )}
      <Text style={styles.groupLabel}>새 알림</Text>
      {items.slice(0, 4).map(([title, body, time, color]) => (
        <Notice key={title} title={title} body={body} time={time} color={color} unread />
      ))}
      <Text style={styles.groupLabel}>이전</Text>
      {items.slice(4).map(([title, body, time, color]) => (
        <Notice key={title} title={title} body={body} time={time} color={color} />
      ))}
    </Screen>
  );
}

function InvitationNotice({ busy, invitation, onAction }) {
  const status = normalizeStatus(invitation.status);
  const canRespond = !['ACCEPTED', 'REJECTED', 'DECLINED'].includes(status);
  const owner = invitation.ownerName || invitation.ownerNickname || invitation.ownerUsername || '친구';
  const title = invitation.title || invitation.scheduleTitle || '초대받은 일정';

  return (
    <Card style={styles.invitationCard}>
      <View style={styles.invitationHeader}>
        <Avatar label={owner.slice(0, 1)} color="#e8f1ff" size={38} />
        <View style={styles.invitationText}>
          <Text numberOfLines={1} style={styles.invitationTitle}>{owner}님의 일정 초대</Text>
          <Text numberOfLines={1} style={styles.invitationBody}>{title}</Text>
        </View>
        <Pill tone={status === 'ACCEPTED' ? 'green' : status === 'REJECTED' ? 'yellow' : 'blue'}>{status}</Pill>
      </View>
      <Text style={styles.invitationMeta}>{invitation.category || '일정'} · {formatDateTime(invitation.startAt)} · {invitation.location || '-'}</Text>
      {canRespond ? (
        <View style={styles.invitationActions}>
          <SecondaryButton style={styles.rejectButton} onPress={() => onAction?.(invitation, 'REJECT')}>거절</SecondaryButton>
          <PrimaryButton style={styles.acceptButton} onPress={() => onAction?.(invitation, 'ACCEPT')}>{busy ? '처리 중' : '수락'}</PrimaryButton>
        </View>
      ) : null}
    </Card>
  );
}

export function AdminScreen({ goBack }) {
  return (
    <Screen left="‹" onBack={goBack} title="예티 ADMIN" subtitle="admin.yeti.app/dashboard">
      <View style={styles.metrics}>
        <Metric label="MAU" value="1,247" change="▲ 12.4%" />
        <Metric label="신규 가입" value="42" change="▲ 3.2%" />
        <Metric label="일정 생성" value="320" change="AI 71%" />
        <Metric label="AI 비용" value="$7.24" change="오늘" />
      </View>
      <Card>
        <Text style={styles.cardTitle}>시간별 API 요청</Text>
        <View style={styles.bars}>
          {[46, 70, 54, 92, 64, 88, 52].map((height, index) => (
            <View key={`${height}-${index}`} style={[styles.bar, { height }]} />
          ))}
        </View>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>시스템 제어</Text>
        <Control label="서비스 점검 모드" />
        <Control label="AI 파싱 긴급 비활성화" />
        <Control label="전체 공지 푸시" />
      </Card>
    </Screen>
  );
}

function Notice({ title, body, time, color, unread }) {
  return (
    <View style={styles.noticeRow}>
      <Avatar label={title[0]} color={color} size={34} />
      <View style={styles.noticeText}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.noticeBody}>{body}</Text>
      </View>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>
        {unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </View>
  );
}

function Metric({ label, value, change }) {
  return (
    <Card style={styles.metric}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Pill>{change}</Pill>
    </Card>
  );
}

function Control({ label }) {
  return (
    <View style={styles.control}>
      <Text style={styles.controlLabel}>{label}</Text>
      <Text style={styles.off}>OFF</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  segmentItem: {
    backgroundColor: '#f4f6f8',
    borderRadius: 16,
    color: '#667085',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  segmentActive: {
    backgroundColor: INK,
    color: '#ffffff',
  },
  groupLabel: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4,
  },
  errorText: {
    color: '#f04454',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 18,
  },
  emptyTitle: {
    color: INK,
    fontSize: 14,
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
  invitationCard: {
    gap: 12,
  },
  invitationHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  invitationText: {
    flex: 1,
  },
  invitationTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  invitationBody: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 3,
  },
  invitationMeta: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
  },
  invitationActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rejectButton: {
    flex: 1,
    height: 42,
  },
  acceptButton: {
    flex: 1,
    height: 42,
  },
  noticeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  noticeText: {
    flex: 1,
  },
  noticeTitle: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
  },
  noticeBody: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
  },
  timeColumn: {
    alignItems: 'center',
    gap: 7,
  },
  time: {
    color: '#a0a8b5',
    fontSize: 10,
    fontWeight: '800',
  },
  unreadDot: {
    backgroundColor: BLUE,
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexBasis: '48%',
    marginBottom: 0,
  },
  metricLabel: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '900',
  },
  metricValue: {
    color: INK,
    fontSize: 23,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 8,
  },
  cardTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
  },
  bars: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    height: 112,
    marginTop: 16,
  },
  bar: {
    backgroundColor: BLUE,
    borderRadius: 5,
    flex: 1,
  },
  control: {
    alignItems: 'center',
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 13,
  },
  controlLabel: {
    color: INK,
    fontSize: 14,
    fontWeight: '800',
  },
  off: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
  },
});
