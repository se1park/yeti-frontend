import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus, Search } from 'lucide-react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, LINE, MUTED, chatRooms } from '../data/yetiData';

export function ChatListScreen({ goTo }) {
  return (
    <Screen noHeader>
      <View style={styles.listHeader}>
        <Text style={styles.mainTitle}>채팅</Text>
        <View style={styles.headerActions}>
          <View style={styles.headerIconButton}>
            <Plus color={INK} size={20} strokeWidth={2.5} />
          </View>
          <Pressable onPress={() => goTo('chatSearch')}>
            <View style={styles.headerIconButton}>
              <Search color={INK} size={20} strokeWidth={2.5} />
            </View>
          </Pressable>
        </View>
      </View>
      <View style={styles.segment}>
        {['전체', '1:1', '그룹', '안 읽음'].map((item, index) => (
          <Text key={item} style={[styles.segmentItem, index === 0 && styles.segmentActive]}>{item}</Text>
        ))}
      </View>
      {chatRooms.map((room, index) => (
        <Pressable key={room.title} onPress={() => goTo('chatRoom')}>
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
          {index < chatRooms.length - 1 ? <View style={styles.divider} /> : null}
        </Pressable>
      ))}
    </Screen>
  );
}

export function ChatRoomScreen({ goTo, goBack }) {
  return (
    <Screen
      left="‹"
      onBack={goBack}
      title="김지민"
      subtitle="활동 중"
      right={<Pressable onPress={() => goTo('chatSettings')}><Text style={styles.headerIcon}>···</Text></Pressable>}
      bottom={<View style={styles.chatInput}><Text style={styles.chatInputText}>메시지 입력</Text><PrimaryButton style={styles.sendButton}>전송</PrimaryButton></View>}
    >
      <Text style={styles.datePill}>어제 · 5월 17일 일요일</Text>
      <Bubble side="left">내일 시간 어때요?</Bubble>
      <Bubble side="left">오후에 회의 잠깐 가능해요?</Bubble>
      <Bubble side="right">오후 2시 정도면 좋아요</Bubble>
      <Bubble side="right">강남에서 봐요!</Bubble>
      <Text style={styles.datePill}>오늘</Text>
      <Card style={styles.sharedSchedule}>
        <Pill>업무 일정 공유</Pill>
        <Text style={styles.sharedTitle}>지민이와 회의</Text>
        <Text style={styles.sharedMeta}>5월 19일(화) · 오후 2:00 - 3:00</Text>
        <Text style={styles.sharedMeta}>강남</Text>
        <SecondaryButton>일정 보기</SecondaryButton>
      </Card>
      <Bubble side="left">확인했어요. 좋아요.</Bubble>
      <Bubble side="left">근데 혹시 한 시간만 늦출 수 있을까요?</Bubble>
      <Card style={styles.timeSuggest}>
        <Text style={styles.suggestLabel}>시간 조율 제안</Text>
        <Text style={styles.suggestText}>기존 화요일 오후 2시{'\n'}제안 → 화요일 오후 3시</Text>
        <View style={styles.suggestButtons}>
          <SecondaryButton>거절</SecondaryButton>
          <PrimaryButton style={styles.grow}>제안 수락</PrimaryButton>
        </View>
      </Card>
    </Screen>
  );
}

function StackedAvatars({ avatars, title }) {
  const colors = [BLUE, '#0fbf73', '#3268ee'];

  return (
    <View style={styles.avatarCluster}>
      {avatars.slice(0, 3).map((avatar, index) => (
        <View key={`${title}-${avatar}`} style={[styles.avatarBubble, styles[`avatarBubble${index}`]]}>
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
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  mainTitle: {
    color: INK,
    fontSize: 26,
    fontWeight: '900',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIcon: {
    color: INK,
    fontSize: 22,
  },
  headerIconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  segment: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
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
  roomRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    minHeight: 62,
  },
  avatarCluster: {
    height: 48,
    position: 'relative',
    width: 58,
  },
  avatarBubble: {
    backgroundColor: '#ffffff',
    borderColor: '#ffffff',
    borderRadius: 999,
    borderWidth: 2,
    position: 'absolute',
  },
  avatarBubble0: {
    left: 0,
    top: 0,
    zIndex: 3,
  },
  avatarBubble1: {
    left: 25,
    top: 5,
    zIndex: 2,
  },
  avatarBubble2: {
    left: 16,
    top: 24,
    zIndex: 1,
  },
  roomText: {
    flex: 1,
  },
  roomTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  roomTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  preview: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
  },
  roomSide: {
    alignItems: 'flex-end',
    gap: 6,
  },
  time: {
    color: '#a1aab8',
    fontSize: 10,
    fontWeight: '800',
  },
  unread: {
    backgroundColor: '#f04454',
    borderRadius: 12,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
    textAlign: 'center',
  },
  divider: {
    backgroundColor: LINE,
    height: 1,
    marginLeft: 58,
  },
  datePill: {
    alignSelf: 'center',
    backgroundColor: '#f1f3f6',
    borderRadius: 12,
    color: '#a0a8b5',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 12,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f2f5',
    borderRadius: 14,
    marginBottom: 8,
    maxWidth: '78%',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  bubbleRight: {
    alignSelf: 'flex-end',
    backgroundColor: BLUE,
  },
  bubbleText: {
    color: INK,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  bubbleTextRight: {
    color: '#ffffff',
  },
  sharedSchedule: {
    marginLeft: 38,
  },
  sharedTitle: {
    color: INK,
    fontSize: 16,
    fontWeight: '900',
    marginTop: 10,
  },
  sharedMeta: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 20,
  },
  timeSuggest: {
    backgroundColor: '#d8f8f6',
    marginLeft: 38,
  },
  suggestLabel: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '900',
  },
  suggestText: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 22,
    marginTop: 7,
  },
  suggestButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  grow: {
    flex: 1.4,
  },
  chatInput: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 20,
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 16,
    paddingRight: 4,
    paddingVertical: 4,
  },
  chatInputText: {
    color: '#a0a8b5',
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
  },
  sendButton: {
    height: 38,
    width: 70,
  },
});
