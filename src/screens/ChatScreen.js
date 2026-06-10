import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function userKeys(user) {
  return [
    user?.id,
    user?.userId,
    user?.sub,
    user?.username,
    user?.email,
  ].filter(Boolean).map((value) => String(value).replace(/^@/, '').toLowerCase());
}

function isCurrentUserMessage(message, currentUser) {
  const keys = userKeys(currentUser);
  if (!keys.length) return false;
  return [
    message?.senderId,
    message?.userId,
    message?.senderUsername,
    message?.username,
    message?.senderEmail,
  ].filter(Boolean).some((value) => keys.includes(String(value).replace(/^@/, '').toLowerCase()));
}

function getRoomMembers(room) {
  return [
    ...(Array.isArray(room?.members) ? room.members : []),
    ...(Array.isArray(room?.participants) ? room.participants : []),
    ...(Array.isArray(room?.users) ? room.users : []),
  ];
}

function getPeerFromRoom(room, currentUser) {
  const keys = userKeys(currentUser);
  const directPeer = {
    nickname: room?.directNickname || room?.friendNickname || '',
    username: room?.directUsername || room?.friendUsername || '',
    profileImageUrl: room?.directProfileImageUrl || room?.friendProfileImageUrl || '',
  };
  if (directPeer.nickname || directPeer.username) return directPeer;

  return getRoomMembers(room).find((member) => {
    const memberKeys = userKeys(member);
    return memberKeys.length && !memberKeys.some((key) => keys.includes(key));
  }) || null;
}

function getPeerName(peer) {
  return peer?.username || peer?.nickname || peer?.name || peer?.displayName || '';
}

function getAvatarLabel(value) {
  const normalized = String(value || '').trim().replace(/^@/, '');
  return (normalized || '채팅').slice(0, 2).toLowerCase();
}

function normalizeRoom(room, index, currentUser) {
  const peer = getPeerFromRoom(room, currentUser);
  const peerName = getPeerName(peer);
  const serverName = room.name && room.name !== '채팅방' ? room.name : '';
  const directTitle = room.directUsername || room.friendUsername || peerName;
  const title = directTitle || room.displayName || room.directNickname || serverName || '채팅방';
  const username = room.directUsername || room.friendUsername || peer?.username || '';
  return {
    id: room.id || `${room.name}-${index}`,
    title,
    preview: username ? `@${username}` : `${room.type || 'CHAT'} · 멤버 ${room.memberCount || 0}명`,
    time: room.createdAt ? new Date(room.createdAt).toLocaleDateString() : '',
    unread: room.unreadCount ? String(room.unreadCount) : '',
    avatars: [getAvatarLabel(username || title)],
    chip: room.type,
    raw: room,
  };
}

export function ChatListScreen({ apiError, currentUser, goTo, onCreateRoom, onOpenRoom, rooms }) {
  const [createVisible, setCreateVisible] = useState(false);
  const [activeSegment, setActiveSegment] = useState('전체');
  const allRooms = (rooms || []).map((room, index) => normalizeRoom(room, index, currentUser));
  const displayRooms = allRooms.filter((room) => {
    const type = String(room.raw?.type || room.chip || '').toUpperCase();
    if (activeSegment === '1:1') return ['DIRECT', 'DM'].includes(type);
    if (activeSegment === '그룹') return type === 'GROUP';
    if (activeSegment === '안 읽음') return Number(room.raw?.unreadCount || room.unread || 0) > 0;
    return true;
  });

  return (
    <View style={styles.flex}>
      <Screen noHeader>
        <View style={styles.listHeader}>
          <Text style={styles.mainTitle}>채팅</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setCreateVisible(true)} style={styles.headerIconButton}>
              <Plus color={INK} size={20} strokeWidth={2.5} />
            </Pressable>
            <Pressable onPress={() => goTo('chatSearch')} style={styles.headerIconButton}>
              <Search color={INK} size={20} strokeWidth={2.5} />
            </Pressable>
          </View>
        </View>
        <View style={styles.segment}>
          {['전체', '1:1', '그룹', '안 읽음'].map((item, index) => (
            <Pressable key={item} accessibilityRole="button" onPress={() => setActiveSegment(item)}>
              <Text style={[styles.segmentItem, (activeSegment === item || (!activeSegment && index === 0)) && styles.segmentActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.chatGrid}>
          <View style={styles.roomListPanel}>
            {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
            {displayRooms.length ? displayRooms.map((room, index) => (
              <Pressable key={room.id} onPress={() => onOpenRoom?.(room.raw)}>
                <View style={styles.roomRow}>
                  <StackedAvatars avatars={room.avatars} title={room.title} />
                  <View style={styles.roomText}>
                    <View style={styles.roomTitleRow}>
                      <Text style={styles.roomTitle}>{room.title}</Text>
                      {room.chip ? <Pill tone="yellow">{room.chip}</Pill> : null}
                    </View>
                    <Text numberOfLines={1} style={styles.preview}>{room.preview}</Text>
                  </View>
                  <View style={styles.roomSide}>
                    <Text style={styles.time}>{room.time}</Text>
                    {room.unread ? <Text style={styles.unread}>{room.unread}</Text> : null}
                  </View>
                </View>
                {index < displayRooms.length - 1 ? <View style={styles.divider} /> : null}
              </Pressable>
            )) : (
              <Card style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>채팅방이 없습니다</Text>
                <Text style={styles.emptyText}>오른쪽 + 버튼으로 친구 username을 입력해 채팅방을 만드세요.</Text>
              </Card>
            )}
          </View>
          <Card style={styles.chatPreviewPanel}>
            <Text style={styles.previewPanelTitle}>대화를 선택하세요</Text>
            <Text style={styles.previewPanelText}>친구와 만든 일정, 초대, 학습 노트 대화를 한 화면에서 확인할 수 있도록 웹앱 레이아웃을 넓혔습니다.</Text>
            <View style={styles.previewPanelMetricRow}>
              <View style={styles.previewPanelMetric}>
                <Text style={styles.previewPanelMetricValue}>{displayRooms.length}</Text>
                <Text style={styles.previewPanelMetricLabel}>채팅방</Text>
              </View>
              <View style={styles.previewPanelMetric}>
                <Text style={styles.previewPanelMetricValue}>{displayRooms.reduce((sum, room) => sum + Number(room.unread || 0), 0)}</Text>
                <Text style={styles.previewPanelMetricLabel}>읽지 않음</Text>
              </View>
            </View>
          </Card>
        </View>
      </Screen>
      <RoomCreateSheet onCreateRoom={onCreateRoom} visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

export function ChatRoomScreen({ chatStatus, currentUser, goTo, goBack, messages, onCreateMediaUpload, onDeleteMessage, onReactMessage, onSendMessage, room }) {
  const [notice, setNotice] = useState('');
  const [draft, setDraft] = useState('');
  const peer = getPeerFromRoom(room, currentUser);
  const peerName = getPeerName(peer);
  const roomTitle = room?.directUsername || peer?.username || peerName || room?.displayName || room?.directNickname || (room?.name !== '채팅방' ? room?.name : '') || '채팅방';
  const roomSubtitle = room?.directUsername || peer?.username ? `@${room.directUsername || peer.username}` : room?.type || '';
  const connected = chatStatus?.status === 'connected';
  const statusLabel = {
    connected: '실시간 연결됨',
    connecting: '실시간 연결 중',
    disconnected: '실시간 연결 끊김',
    error: '실시간 연결 실패',
  }[chatStatus?.status || 'connecting'];

  const media = async () => {
    if (!room?.id) return;
    try {
      const payload = await onCreateMediaUpload?.(room.id, 'image/png');
      setNotice(payload?.uploadUrl ? '미디어 업로드 URL을 발급했습니다.' : '미디어 URL 요청 완료');
    } catch (error) {
      setNotice(error.message || '미디어 URL 요청에 실패했습니다.');
    }
  };

  const submit = async () => {
    if (!draft.trim()) return;
    try {
      await onSendMessage?.(room?.id, draft);
      setDraft('');
    } catch (error) {
      setNotice(error.message || '메시지를 전송하지 못했습니다.');
    }
  };

  return (
    <Screen
      left="‹"
      onBack={goBack}
      title={roomTitle}
      subtitle={roomSubtitle}
      bottom={(
        <View style={styles.chatComposer}>
          <TextInput
            onChangeText={setDraft}
            onSubmitEditing={submit}
            placeholder="메시지를 입력하세요"
            placeholderTextColor="#a0a8b5"
            style={styles.chatInput}
            value={draft}
          />
          <Pressable onPress={media} style={styles.mediaButton}>
            <Text style={styles.mediaButtonText}>미디어</Text>
          </Pressable>
          <Pressable disabled={!connected || !draft.trim()} onPress={submit} style={[styles.sendButton, (!connected || !draft.trim()) && styles.sendButtonDisabled]}>
            <Text style={styles.sendButtonText}>전송</Text>
          </Pressable>
        </View>
      )}
    >
      <View style={styles.statusRow}>
        <Text style={[styles.statusDot, connected && styles.statusDotConnected]}>●</Text>
        <Text style={styles.statusText}>{statusLabel}</Text>
        {chatStatus?.message ? <Text numberOfLines={1} style={styles.statusMessage}>{chatStatus.message}</Text> : null}
      </View>
      {notice ? <Text style={styles.errorText}>{notice}</Text> : null}
      {(messages || []).length ? messages.map((item) => {
        const mine = isCurrentUserMessage(item, currentUser);
        return (
        <View key={item.id} style={[styles.messageBlock, mine && styles.messageBlockMine]}>
          <Bubble side={mine ? 'right' : 'left'}>{item.deleted ? '삭제된 메시지입니다.' : item.content || item.messageType}</Bubble>
          <View style={[styles.messageActions, mine && styles.messageActionsMine]}>
            <Text style={styles.time}>{mine ? '나' : item.senderNickname || item.senderUsername || roomTitle} · {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</Text>
            <Text onPress={() => onReactMessage?.(item.id, '👍')} style={styles.actionText}>👍</Text>
            {mine ? <Text onPress={() => onDeleteMessage?.(item.id)} style={styles.deleteText}>삭제</Text> : null}
          </View>
        </View>
        );
      }) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>메시지가 없습니다</Text>
          <Text style={styles.emptyText}>첫 메시지를 보내 대화를 시작하세요.</Text>
        </Card>
      )}
    </Screen>
  );
}

function RoomCreateSheet({ visible, onClose, onCreateRoom }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
  const [pinnedScheduleId, setPinnedScheduleId] = useState('');
  const [message, setMessage] = useState('');

  const submit = async () => {
    const memberUsernames = members.split(',').map((item) => item.trim().replace(/^@/, '')).filter(Boolean);
    if (!memberUsernames.length) {
      setMessage('초대할 username을 입력해주세요.');
      return;
    }
    try {
      await onCreateRoom?.({
        type: memberUsernames.length > 1 ? 'GROUP' : 'DIRECT',
        name: name.trim(),
        memberUsernames,
        ...(pinnedScheduleId.trim() ? { pinnedScheduleId: pinnedScheduleId.trim() } : {}),
      });
      setName('');
      setMembers('');
      setPinnedScheduleId('');
      setMessage('');
      onClose?.();
    } catch (error) {
      setMessage(error.message || '채팅방 생성에 실패했습니다.');
    }
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>채팅방 만들기</Text>
            <Pressable hitSlop={10} onPress={onClose} style={styles.sheetClose}>
              <Text style={styles.sheetCloseText}>×</Text>
            </Pressable>
          </View>
          <TextInput value={name} onChangeText={setName} placeholder="방 이름" placeholderTextColor="#a0a8b5" style={styles.sheetInput} />
          <TextInput value={members} onChangeText={setMembers} placeholder="username, username" placeholderTextColor="#a0a8b5" style={styles.sheetInput} />
          <TextInput value={pinnedScheduleId} onChangeText={setPinnedScheduleId} placeholder="pinnedScheduleId (선택)" placeholderTextColor="#a0a8b5" style={styles.sheetInput} />
          {message ? <Text style={styles.errorText}>{message}</Text> : null}
          <PrimaryButton onPress={submit}>생성</PrimaryButton>
        </View>
      </View>
    </Modal>
  );
}

function StackedAvatars({ avatars, title }) {
  const colors = [BLUE, '#0fbf73', '#3268ee'];
  return (
    <View style={styles.avatarCluster}>
      {avatars.slice(0, 3).map((avatar, index) => (
        <View key={`${title}-${avatar}-${index}`} style={[styles.avatarBubble, styles[`avatarBubble${index}`]]}>
          <Avatar label={avatar} color={colors[index % colors.length]} size={index === 0 ? 34 : 28} />
        </View>
      ))}
    </View>
  );
}

function Bubble({ children, side }) {
  const right = side === 'right';
  return (
    <View style={[styles.bubble, right && styles.bubbleRight]}>
      <Text style={[styles.bubbleText, right && styles.bubbleTextRight]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  mainTitle: { color: INK, fontSize: 26, fontWeight: '900' },
  headerActions: { flexDirection: 'row', gap: 8 },
  headerIcon: { color: INK, fontSize: 22 },
  headerIconButton: { alignItems: 'center', height: 36, justifyContent: 'center', width: 36 },
  segment: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segmentItem: { backgroundColor: '#f4f6f8', borderRadius: 16, color: '#667085', fontSize: 12, fontWeight: '900', overflow: 'hidden', paddingHorizontal: 12, paddingVertical: 8 },
  segmentActive: { backgroundColor: INK, color: '#ffffff' },
  errorText: { color: '#f04454', fontSize: 12, fontWeight: '800', marginBottom: 10 },
  chatGrid: { flexDirection: Platform.OS === 'web' ? 'row' : 'column', gap: Platform.OS === 'web' ? 18 : 0 },
  roomListPanel: { flex: Platform.OS === 'web' ? 1.1 : undefined, minWidth: Platform.OS === 'web' ? 360 : undefined },
  chatPreviewPanel: { display: Platform.OS === 'web' ? 'flex' : 'none', flex: 0.9, justifyContent: 'space-between', minHeight: 260, minWidth: 320 },
  previewPanelTitle: { color: INK, fontSize: 22, fontWeight: '900' },
  previewPanelText: { color: MUTED, fontSize: 13, fontWeight: '700', lineHeight: 20, marginTop: 10 },
  previewPanelMetricRow: { flexDirection: 'row', gap: 10, marginTop: 20 },
  previewPanelMetric: { backgroundColor: '#f4f6f8', borderRadius: 14, flex: 1, padding: 14 },
  previewPanelMetricValue: { color: INK, fontSize: 26, fontWeight: '900' },
  previewPanelMetricLabel: { color: MUTED, fontSize: 12, fontWeight: '900', marginTop: 4 },
  roomRow: { alignItems: 'center', flexDirection: 'row', gap: 12, minHeight: 62 },
  avatarCluster: { height: 48, position: 'relative', width: 58 },
  avatarBubble: { backgroundColor: '#ffffff', borderColor: '#ffffff', borderRadius: 999, borderWidth: 2, position: 'absolute' },
  avatarBubble0: { left: 0, top: 0, zIndex: 3 },
  avatarBubble1: { left: 25, top: 5, zIndex: 2 },
  avatarBubble2: { left: 16, top: 24, zIndex: 1 },
  roomText: { flex: 1 },
  roomTitleRow: { alignItems: 'center', flexDirection: 'row', gap: 6 },
  roomTitle: { color: INK, fontSize: 14, fontWeight: '900' },
  preview: { color: MUTED, fontSize: 12, fontWeight: '700', marginTop: 5 },
  roomSide: { alignItems: 'flex-end', gap: 6 },
  time: { color: '#a1aab8', fontSize: 10, fontWeight: '800' },
  unread: { backgroundColor: '#f04454', borderRadius: 12, color: '#ffffff', fontSize: 11, fontWeight: '900', minWidth: 24, overflow: 'hidden', paddingHorizontal: 7, paddingVertical: 4, textAlign: 'center' },
  divider: { backgroundColor: LINE, height: 1, marginLeft: 58 },
  emptyCard: { alignItems: 'center', paddingVertical: 22 },
  emptyTitle: { color: INK, fontSize: 15, fontWeight: '900' },
  emptyText: { color: MUTED, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 6, textAlign: 'center' },
  bubble: { alignSelf: 'flex-start', backgroundColor: '#f0f2f5', borderRadius: 14, marginBottom: 8, maxWidth: '78%', paddingHorizontal: 13, paddingVertical: 10 },
  bubbleRight: { alignSelf: 'flex-end', backgroundColor: BLUE },
  bubbleText: { color: INK, fontSize: 13, fontWeight: '700', lineHeight: 19 },
  bubbleTextRight: { color: '#ffffff' },
  messageBlock: { marginBottom: 10 },
  messageBlockMine: { alignItems: 'flex-end' },
  messageActions: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 4 },
  messageActionsMine: { justifyContent: 'flex-end' },
  actionText: { color: BLUE, fontSize: 13, fontWeight: '900' },
  deleteText: { color: '#f04454', fontSize: 12, fontWeight: '900' },
  chatComposer: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: LINE,
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    minHeight: 52,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chatInput: {
    color: INK,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    height: 36,
    outlineStyle: 'none',
    paddingHorizontal: 2,
  },
  mediaButton: {
    alignItems: 'center',
    backgroundColor: '#f3f6fb',
    borderColor: LINE,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  mediaButtonText: { color: MUTED, fontSize: 12, fontWeight: '900' },
  sendButton: {
    alignItems: 'center',
    backgroundColor: BLUE,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  sendButtonDisabled: {
    opacity: 0.42,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  statusDot: { color: '#f04454', fontSize: 11, fontWeight: '900' },
  statusDotConnected: { color: '#12b76a' },
  statusMessage: { color: '#f04454', flex: 1, fontSize: 11, fontWeight: '800' },
  statusRow: { alignItems: 'center', flexDirection: 'row', gap: 6, marginBottom: 10 },
  statusText: { color: MUTED, fontSize: 12, fontWeight: '900' },
  modalBackdrop: { alignItems: Platform.OS === 'web' ? 'center' : 'stretch', backgroundColor: 'rgba(17, 24, 39, 0.48)', flex: 1, justifyContent: Platform.OS === 'web' ? 'center' : 'flex-end', padding: Platform.OS === 'web' ? 24 : 0 },
  sheet: { backgroundColor: '#ffffff', borderRadius: Platform.OS === 'web' ? 18 : 0, borderTopLeftRadius: 18, borderTopRightRadius: 18, maxWidth: Platform.OS === 'web' ? 460 : undefined, padding: 18, paddingBottom: 30, width: '100%' },
  sheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sheetTitle: { color: INK, fontSize: 19, fontWeight: '900' },
  sheetClose: { alignItems: 'center', height: 34, justifyContent: 'center', width: 34 },
  sheetCloseText: { color: INK, fontSize: 24, fontWeight: '800', lineHeight: 28 },
  sheetInput: { borderColor: BLUE, borderRadius: 9, borderWidth: 1.5, color: INK, fontSize: 14, fontWeight: '800', height: 46, marginBottom: 12, paddingHorizontal: 14 },
});
