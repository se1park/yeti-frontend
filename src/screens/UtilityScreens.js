import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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

function readPageContent(page) {
  if (Array.isArray(page)) return page;
  return page?.content || page?.items || page?.data?.content || [];
}

export function NotificationsScreen({
  apiBusy,
  apiError,
  goBack,
  invitations = [],
  notifications = [],
  onInvitationAction,
  onMarkAllRead,
  onMarkRead,
}) {
  return (
    <Screen left="‹" onBack={goBack} onRight={onMarkAllRead} title="알림" right="전체 읽음">
      <View style={styles.segment}>
        {['전체', '일정', '채팅', '친구', '시스템'].map((item, index) => (
          <Text key={item} style={[styles.segmentItem, index === 0 && styles.segmentActive]}>{item}</Text>
        ))}
      </View>
      {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
      <View style={styles.noticeGrid}>
        <View style={styles.noticePanel}>
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
        </View>
        <View style={styles.noticePanel}>
          <Text style={styles.groupLabel}>새 알림</Text>
          {notifications.length ? notifications.map((notification) => (
            <Notice
              body={notification.body || notification.scheduleTitle || notification.data || ''}
              color={notification.read ? '#f8fafc' : '#eff6ff'}
              key={notification.id}
              onPress={() => onMarkRead?.(notification.id)}
              time={formatDateTime(notification.sentAt || notification.createdAt)}
              title={notification.title || notification.type || '알림'}
              unread={!notification.read}
            />
          )) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>알림이 없습니다</Text>
              <Text style={styles.emptyText}>백엔드 알림이 오면 여기에서 바로 확인할 수 있어요.</Text>
            </Card>
          )}
        </View>
      </View>
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

export function AdminScreen({
  adminData = {},
  goBack,
  onActivateUser,
  onBroadcast,
  onEmail,
  onRefresh,
  onRegisterFcmToken,
  onReviewReport,
  onSetMaintenance,
  onSuspendUser,
}) {
  const [adminMessage, setAdminMessage] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailTarget, setEmailTarget] = useState('');
  const [fcmToken, setFcmToken] = useState('');
  const dashboard = adminData.dashboard || {};
  const adminErrors = adminData.errors || [];
  const users = readPageContent(adminData.users);
  const reports = readPageContent(adminData.reports);
  const apiLogs = readPageContent(adminData.apiLogs);
  const maintenanceEnabled = Boolean(adminData.maintenance?.enabled ?? Object.values(adminData.maintenance || {})[0]);

  return (
    <Screen left="‹" onBack={goBack} onRight={onRefresh} title="예티 ADMIN" subtitle="admin.yeti.app/dashboard" right="새로고침">
      {adminErrors.length ? <Text style={styles.errorText}>{adminErrors[0]}</Text> : null}
      <View style={styles.metrics}>
        <Metric label="MAU" value={dashboard.mau ?? '-'} change="월간" />
        <Metric label="신규 가입" value={dashboard.dailyNewUsers ?? '-'} change="오늘" />
        <Metric label="일정 생성" value={dashboard.todayScheduleCount ?? '-'} change="오늘" />
        <Metric label="AI 비용" value={dashboard.monthlyAiCostUsd != null ? `$${dashboard.monthlyAiCostUsd}` : '-'} change="월간" />
      </View>
      <Card>
        <Text style={styles.cardTitle}>최근 API 로그</Text>
        {apiLogs.length ? apiLogs.slice(0, 5).map((log, index) => (
          <InfoLine key={log.id || index} label={log.path || log.endpoint || log.method || 'API'} value={log.statusCode || log.status || log.createdAt || ''} />
        )) : <Text style={styles.emptyText}>로그 데이터가 없습니다.</Text>}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>시스템 제어</Text>
        <Control active={maintenanceEnabled} label="서비스 점검 모드" onPress={() => onSetMaintenance?.(!maintenanceEnabled)} />
        <TextInput
          onChangeText={setBroadcastTitle}
          placeholder="공지 제목"
          placeholderTextColor="#98a2b3"
          style={styles.adminInput}
          value={broadcastTitle}
        />
        <TextInput
          multiline
          onChangeText={setBroadcastBody}
          placeholder="공지 내용"
          placeholderTextColor="#98a2b3"
          style={[styles.adminInput, styles.adminTextarea]}
          value={broadcastBody}
        />
        <Control label="전체 공지 발송" onPress={async () => {
          if (!broadcastTitle.trim() || !broadcastBody.trim()) {
            setAdminMessage('공지 제목과 내용을 입력해주세요.');
            return;
          }
          await onBroadcast?.({ title: broadcastTitle.trim(), body: broadcastBody.trim() });
          setBroadcastTitle('');
          setBroadcastBody('');
          setAdminMessage('Broadcast sent');
        }} />
        <TextInput
          onChangeText={setFcmToken}
          placeholder="FCM token"
          placeholderTextColor="#98a2b3"
          style={styles.adminInput}
          value={fcmToken}
        />
        <Control label="FCM token 등록" onPress={async () => {
          await onRegisterFcmToken?.(fcmToken);
          setFcmToken('');
          setAdminMessage('FCM token registered');
        }} />
        {adminMessage ? <Text style={styles.successText}>{adminMessage}</Text> : null}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>Email</Text>
        <TextInput onChangeText={setEmailTarget} placeholder="target user id or email" placeholderTextColor="#98a2b3" style={styles.adminInput} value={emailTarget} />
        <TextInput onChangeText={setEmailSubject} placeholder="subject" placeholderTextColor="#98a2b3" style={styles.adminInput} value={emailSubject} />
        <TextInput multiline onChangeText={setEmailBody} placeholder="message" placeholderTextColor="#98a2b3" style={[styles.adminInput, styles.adminTextarea]} value={emailBody} />
        <Control label="Email 발송" onPress={async () => {
          await onEmail?.({
            body: emailBody,
            message: emailBody,
            subject: emailSubject,
            target: emailTarget,
            userId: emailTarget,
          });
          setAdminMessage('Email sent');
        }} />
      </Card>
      <Card>
        <Text style={styles.cardTitle}>사용자</Text>
        {users.length ? users.slice(0, 5).map((user) => (
          <View key={user.id || user.userId || user.email} style={styles.adminRow}>
            <InfoLine label={user.nickname || user.username || user.email || '사용자'} value={user.active === false ? '정지' : '활성'} />
            <View style={styles.rowActions}>
              <SecondaryButton style={styles.rowButton} onPress={() => onSuspendUser?.(user.id || user.userId)}>Suspend</SecondaryButton>
              <PrimaryButton style={styles.rowButton} onPress={() => onActivateUser?.(user.id || user.userId)}>Activate</PrimaryButton>
            </View>
          </View>
        )) : <Text style={styles.emptyText}>사용자 데이터가 없습니다.</Text>}
      </Card>
      <Card>
        <Text style={styles.cardTitle}>신고</Text>
        {reports.length ? reports.slice(0, 5).map((report) => (
          <View key={report.id} style={styles.adminRow}>
            <InfoLine label={report.reason || report.type || '신고'} value={report.status || ''} />
            <View style={styles.rowActions}>
              <SecondaryButton style={styles.rowButton} onPress={() => onReviewReport?.(report.id, 'REJECTED')}>Reject</SecondaryButton>
              <PrimaryButton style={styles.rowButton} onPress={() => onReviewReport?.(report.id, 'RESOLVED')}>Resolve</PrimaryButton>
            </View>
          </View>
        )) : <Text style={styles.emptyText}>신고 데이터가 없습니다.</Text>}
      </Card>
    </Screen>
  );
}

export function ApiDiagnosticsScreen({ goBack, onRun, results = [] }) {
  const [running, setRunning] = useState(false);
  const hasResults = results.length > 0;

  const run = async () => {
    setRunning(true);
    try {
      await onRun?.();
    } finally {
      setRunning(false);
    }
  };

  return (
    <Screen left="‹" onBack={goBack} title="API 연결 진단" subtitle="현재 로그인 세션으로 백엔드 읽기 API를 확인합니다.">
      <Card>
        <Text style={styles.cardTitle}>Backend smoke test</Text>
        <Text style={styles.emptyText}>일반 사용자 API는 OK가 떠야 하고, 관리자 API는 일반 계정에서 권한 필요가 정상일 수 있습니다.</Text>
        <PrimaryButton onPress={run} style={styles.diagnosticButton}>{running ? '확인 중...' : '현재 세션으로 확인'}</PrimaryButton>
      </Card>
      <Card>
        <Text style={styles.cardTitle}>결과</Text>
        {hasResults ? results.map((item) => (
          <View key={item.label} style={styles.diagnosticRow}>
            <View style={[styles.statusDot, item.status === 'ok' && styles.statusOk, item.status === 'permission' && styles.statusPermission, item.status === 'error' && styles.statusError]} />
            <View style={styles.diagnosticText}>
              <Text style={styles.controlLabel}>{item.label}</Text>
              <Text style={styles.diagnosticDetail}>{item.detail}</Text>
            </View>
            <Text style={[styles.diagnosticStatus, item.status === 'ok' && styles.statusTextOk, item.status === 'error' && styles.statusTextError]}>
              {item.status === 'ok' ? 'OK' : item.status === 'permission' ? '권한' : '실패'}
            </Text>
          </View>
        )) : (
          <Text style={styles.emptyText}>아직 진단을 실행하지 않았습니다.</Text>
        )}
      </Card>
    </Screen>
  );
}

function Notice({ title, body, time, color, unread, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.noticeRow, pressed && styles.pressed]}>
      <Avatar label={title[0]} color={color} size={34} />
      <View style={styles.noticeText}>
        <Text style={styles.noticeTitle}>{title}</Text>
        <Text numberOfLines={2} style={styles.noticeBody}>{body}</Text>
      </View>
      <View style={styles.timeColumn}>
        <Text style={styles.time}>{time}</Text>
        {unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </Pressable>
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

function InfoLine({ label, value }) {
  return (
    <View style={styles.control}>
      <Text numberOfLines={1} style={styles.controlLabel}>{label}</Text>
      <Text numberOfLines={1} style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function Control({ active, label, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
      <Text style={styles.controlLabel}>{label}</Text>
      <Text style={[styles.off, active && styles.on]}>{active ? 'ON' : 'OFF'}</Text>
    </Pressable>
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
  noticeGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 18 : 0,
  },
  noticePanel: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 340 : undefined,
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
  successText: {
    color: '#12b76a',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 8,
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
  adminInput: {
    backgroundColor: '#f8fafc',
    borderColor: LINE,
    borderRadius: 8,
    borderWidth: 1,
    color: INK,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 10,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  adminTextarea: {
    minHeight: 86,
    textAlignVertical: 'top',
  },
  diagnosticButton: {
    marginTop: 14,
  },
  diagnosticRow: {
    alignItems: 'center',
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 12,
  },
  diagnosticText: {
    flex: 1,
  },
  diagnosticDetail: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 3,
  },
  diagnosticStatus: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '900',
  },
  statusDot: {
    backgroundColor: '#cbd5e1',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  statusOk: {
    backgroundColor: '#12b76a',
  },
  statusPermission: {
    backgroundColor: '#f59e0b',
  },
  statusError: {
    backgroundColor: '#f04454',
  },
  statusTextOk: {
    color: '#12b76a',
  },
  statusTextError: {
    color: '#f04454',
  },
  adminRow: {
    borderBottomColor: LINE,
    borderBottomWidth: 1,
    paddingBottom: 10,
  },
  rowActions: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  rowButton: {
    height: 36,
    minWidth: 96,
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
  on: {
    color: BLUE,
  },
  infoValue: {
    color: MUTED,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 10,
    textAlign: 'right',
  },
  pressed: {
    opacity: 0.76,
  },
});
