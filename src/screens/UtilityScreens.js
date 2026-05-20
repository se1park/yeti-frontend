import { StyleSheet, Text, View } from 'react-native';
import { Avatar, Card, Pill, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

export function NotificationsScreen({ goBack }) {
  const items = [
    ['박수아님이 약속에 초대했어요', '북한산 등산 · 5월 23일(토) 오전 9시', '방금', '#fff7ed'],
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
