import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle, Plus, Search } from 'lucide-react-native';
import { Avatar, Card, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

function normalizeFriend(item, index) {
  if (Array.isArray(item)) {
    return {
      friendshipId: `${item[1]}-${index}`,
      name: item[0],
      handle: item[1],
      message: item[2],
      initial: item[0]?.[0] || '?',
    };
  }

  return {
    friendshipId: item.friendshipId || item.friendship_id || item.requestId || item.id || `${item.username}-${index}`,
    name: item.nickname || item.username || '사용자',
    handle: item.username ? `@${item.username}` : '',
    message: item.statusMessage || item.status || '함께 약속을 잡아보세요',
    initial: (item.nickname || item.username || '?').slice(0, 1),
    raw: item,
  };
}

export function FriendsScreen({ apiError, friendRequests, friends, goTo, onBlockFriend, onDeleteFriend, onOpenFriend, onRequestAction, onSendRequest }) {
  const [addVisible, setAddVisible] = useState(false);
  const requests = (friendRequests?.length ? friendRequests : []).map(normalizeFriend);
  const displayFriends = (friends || []).map(normalizeFriend);

  return (
    <View style={styles.flex}>
      <Screen title="친구" right={<Pressable onPress={() => setAddVisible(true)} style={styles.headerIcon}><Plus color={INK} size={20} strokeWidth={2.5} /></Pressable>}>
        <View style={styles.searchBox}>
          <View style={styles.searchLeft}>
            <Search color="#98a2b3" size={15} strokeWidth={2.4} />
            <Text style={styles.searchText}>닉네임으로 친구 찾기</Text>
          </View>
          <Text style={styles.qrBadge}>QR</Text>
        </View>
        <SectionTitle right="모두 보기 ›">받은 요청 <Text style={styles.countBadge}>{requests.length}</Text></SectionTitle>
        {apiError ? <Text style={styles.errorText}>{apiError}</Text> : null}
        {requests.length ? (
          requests.map((request, index) => (
            <Card key={request.friendshipId} style={styles.request}>
              <View style={styles.requestInfo}>
                <Avatar label={request.initial} color={index ? '#06b6d4' : '#c026d3'} />
                <View style={styles.text}>
                  <Text style={styles.name}>{request.name}</Text>
                  <Text numberOfLines={1} style={styles.meta}>{[request.handle, request.message].filter(Boolean).join(' · ')}</Text>
                </View>
              </View>
              <View style={styles.requestActions}>
                <SecondaryButton onPress={() => onRequestAction?.(request.friendshipId, 'reject')} style={styles.smallButton}>
                  <Text numberOfLines={1} style={styles.rejectText}>거절</Text>
                </SecondaryButton>
                <PrimaryButton onPress={() => onRequestAction?.(request.friendshipId, 'accept')} style={styles.smallButton}>
                  <Text numberOfLines={1} style={styles.acceptText}>수락</Text>
                </PrimaryButton>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>받은 친구 요청이 없습니다</Text>
            <Text style={styles.emptyText}>새 요청이 오면 여기에서 수락하거나 거절할 수 있어요.</Text>
          </Card>
        )}
        <SectionTitle right="이름순⌄">친구 {displayFriends.length}</SectionTitle>
        {displayFriends.length ? (
          displayFriends.map((friend, index) => (
            <Pressable key={friend.friendshipId} onPress={() => onOpenFriend?.(friend.raw || friend)}>
              <Card style={styles.friend}>
              <Avatar label={friend.initial} color={['#a855f7', BLUE, '#0fbf73', '#fb923c', '#f04454'][index % 5]} />
              <View style={styles.text}>
                <Text style={styles.name}>{friend.name} <Text style={styles.handle}>{friend.handle}</Text></Text>
                <Text style={styles.meta}>{friend.message}</Text>
              </View>
              <View style={styles.chatCircle}>
                <MessageCircle color={BLUE} size={15} strokeWidth={2.4} />
              </View>
              <Text onPress={() => onDeleteFriend?.(friend.friendshipId)} style={styles.friendAction}>삭제</Text>
              <Text onPress={() => onBlockFriend?.(friend.friendshipId)} style={styles.blockAction}>차단</Text>
              </Card>
            </Pressable>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>친구가 없습니다</Text>
            <Text style={styles.emptyText}>친구 추가 버튼으로 username을 입력해 요청을 보내세요.</Text>
          </Card>
        )}
      </Screen>
      <FriendAddSheet onSendRequest={onSendRequest} visible={addVisible} onClose={() => setAddVisible(false)} />
    </View>
  );
}

function FriendAddSheet({ visible, onClose, onSendRequest }) {
  const [username, setUsername] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async () => {
    if (!username.trim()) {
      setMessage('username을 입력해주세요.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const targetUsername = username.trim().replace(/^@/, '');
      await onSendRequest?.(targetUsername);
      setMessage(`@${targetUsername}님에게 친구 요청을 보냈습니다.`);
      setMessage('친구 요청을 보냈습니다.');
      setUsername('');
    } catch (error) {
      setMessage(error.message || '친구 요청에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.modalBackdrop}>
      <Pressable onPress={onClose} style={styles.backdropPressArea} />
      <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Pressable hitSlop={10} onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>×</Text>
          </Pressable>
          <Text style={styles.sheetTitle}>친구 추가</Text>
          <Text style={styles.sheetSub}>상대방의 username을 입력해 친구 요청을 보내세요.</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setUsername}
            placeholder="@username"
            placeholderTextColor="#a0a8b5"
            style={styles.addInput}
            value={username}
          />
          {message ? <Text style={styles.sheetMessage}>{message}</Text> : null}
          <PrimaryButton onPress={submit}>{busy ? '요청 중...' : '친구 요청 보내기'}</PrimaryButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  headerIcon: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'flex-end',
    width: 36,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    padding: 12,
  },
  searchLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  searchText: {
    color: '#98a2b3',
    fontSize: 13,
    fontWeight: '800',
  },
  qrBadge: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    color: MUTED,
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countBadge: {
    backgroundColor: BLUE,
    color: '#ffffff',
    fontSize: 10,
  },
  errorText: {
    color: '#f04454',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 10,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 22,
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
  request: {
    gap: 12,
    padding: 12,
  },
  requestInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  friend: {
    alignItems: 'center',
    borderWidth: 0,
    flexDirection: 'row',
    gap: 12,
    shadowOpacity: 0,
  },
  text: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  handle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3,
  },
  smallButton: {
    flex: 1,
    height: 34,
    paddingHorizontal: 0,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  rejectText: {
    color: INK,
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  acceptText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    lineHeight: 18,
  },
  chatCircle: {
    alignItems: 'center',
    backgroundColor: '#e8f1ff',
    borderRadius: 14,
    height: 30,
    justifyContent: 'center',
    width: 30,
  },
  friendAction: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '900',
  },
  blockAction: {
    color: '#f04454',
    fontSize: 11,
    fontWeight: '900',
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  backdropPressArea: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxWidth: 430,
    padding: 18,
    paddingBottom: 104,
    width: '100%',
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 15,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 14,
    top: 12,
    width: 30,
  },
  closeButtonText: {
    color: INK,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 26,
  },
  handleBar: {
    alignSelf: 'center',
    backgroundColor: '#d0d5dd',
    borderRadius: 2,
    height: 4,
    marginBottom: 14,
    width: 34,
  },
  sheetTitle: {
    color: INK,
    fontSize: 19,
    fontWeight: '900',
  },
  sheetSub: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 14,
    marginTop: 4,
  },
  sheetMessage: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 12,
  },
  addInput: {
    borderColor: BLUE,
    borderRadius: 9,
    borderWidth: 1.5,
    color: INK,
    fontSize: 14,
    fontWeight: '800',
    height: 46,
    marginBottom: 12,
    paddingHorizontal: 14,
  },
  sendButton: {
    marginTop: 4,
  },
  resultCard: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  requestButton: {
    flex: 0,
    height: 38,
    paddingHorizontal: 14,
  },
  dividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  divider: {
    backgroundColor: LINE,
    flex: 1,
    height: 1,
  },
  dividerText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
  },
  qrCard: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 14,
    padding: 13,
  },
  qrFake: {
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    height: 72,
    justifyContent: 'center',
    width: 72,
  },
  qrText: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  shareButton: {
    flex: 0,
    height: 32,
    marginTop: 8,
    paddingHorizontal: 12,
  },
});
