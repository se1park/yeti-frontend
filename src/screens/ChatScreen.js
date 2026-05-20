import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function normalizeRoom(room, index) {
  return {
    id: room.id || `${room.name}-${index}`,
    title: room.name || '채팅방',
    preview: `${room.type || 'CHAT'} · 멤버 ${room.memberCount || 0}명`,
    time: room.createdAt ? new Date(room.createdAt).toLocaleDateString() : '',
    unread: room.unreadCount ? String(room.unreadCount) : '',
    avatars: [(room.name || '채').slice(0, 1)],
    chip: room.type,
    raw: room,
  };
}

export function ChatListScreen({ apiError, goTo, onCreateRoom, onOpenRoom, rooms }) {
  const [createVisible, setCreateVisible] = useState(false);
  const displayRooms = (rooms || []).map(normalizeRoom);

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
            <Text key={item} style={[styles.segmentItem, index === 0 && styles.segmentActive]}>{item}</Text>
          ))}
        </View>
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
      </Screen>
      <RoomCreateSheet onCreateRoom={onCreateRoom} visible={createVisible} onClose={() => setCreateVisible(false)} />
    </View>
  );
}

export function ChatRoomScreen({ goTo, goBack, messages, onCreateMediaUpload, onDeleteMessage, onReactMessage, room }) {
  const [notice, setNotice] = useState('');
  const roomTitle = room?.name || '채팅방';

  const media = async () => {
    if (!room?.id) return;
    try {
      const payload = await onCreateMediaUpload?.(room.id, 'image/png');
      setNotice(payload?.uploadUrl ? '미디어 업로드 URL을 발급했습니다.' : '미디어 URL 요청 완료');
    } catch (error) {
      setNotice(error.message || '미디어 URL 요청에 실패했습니다.');
    }
  };

  return (
    <Screen
      left="‹"
      onBack={goBack}
      title={roomTitle}
      subtitle={room?.type || ''}
      right={<Pressable onPress={() => goTo('chatSettings')}><Text style={styles.headerIcon}>···</Text></Pressable>}
      bottom={<View style={styles.chatInput}><Text style={styles.chatInputText}>메시지 전송 API 미제공</Text><PrimaryButton onPress={media} style={styles.sendButton}>미디어</PrimaryButton></View>}
    >
      {notice ? <Text style={styles.errorText}>{notice}</Text> : null}
      {(messages || []).length ? messages.map((item) => (
        <View key={item.id} style={styles.messageBlock}>
          <Bubble side="left">{item.deleted ? '삭제된 메시지입니다.' : item.content || item.messageType}</Bubble>
          <View style={styles.messageActions}>
            <Text style={styles.time}>{item.senderNickname || '사용자'} · {item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : ''}</Text>
            <Text onPress={() => onReactMessage?.(item.id, '👍')} style={styles.actionText}>👍</Text>
            <Text onPress={() => onDeleteMessage?.(item.id)} style={styles.deleteText}>삭제</Text>
          </View>
        </View>
      )) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>메시지가 없습니다</Text>
          <Text style={styles.emptyText}>현재 서버에는 메시지 조회, 리액션, 삭제 API만 제공됩니다.</Text>
        </Card>
      )}
    </Screen>
  );
}

function RoomCreateSheet({ visible, onClose, onCreateRoom }) {
  const [name, setName] = useState('');
  const [members, setMembers] = useState('');
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
      });
      setName('');
      setMembers('');
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
          <Text style={styles.sheetTitle}>채팅방 만들기</Text>
          <TextInput value={name} onChangeText={setName} placeholder="방 이름" placeholderTextColor="#a0a8b5" style={styles.sheetInput} />
          <TextInput value={members} onChangeText={setMembers} placeholder="username, username" placeholderTextColor="#a0a8b5" style={styles.sheetInput} />
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
  messageActions: { alignItems: 'center', flexDirection: 'row', gap: 12, marginBottom: 4 },
  actionText: { color: BLUE, fontSize: 13, fontWeight: '900' },
  deleteText: { color: '#f04454', fontSize: 12, fontWeight: '900' },
  chatInput: { alignItems: 'center', backgroundColor: '#f4f6f8', borderRadius: 20, flexDirection: 'row', gap: 10, paddingLeft: 16, paddingRight: 4, paddingVertical: 4 },
  chatInputText: { color: '#a0a8b5', flex: 1, fontSize: 13, fontWeight: '700' },
  sendButton: { height: 38, width: 78 },
  modalBackdrop: { backgroundColor: 'rgba(17, 24, 39, 0.48)', flex: 1, justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#ffffff', borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 18, paddingBottom: 30 },
  sheetTitle: { color: INK, fontSize: 19, fontWeight: '900', marginBottom: 12 },
  sheetInput: { borderColor: BLUE, borderRadius: 9, borderWidth: 1.5, color: INK, fontSize: 14, fontWeight: '800', height: 46, marginBottom: 12, paddingHorizontal: 14 },
});
