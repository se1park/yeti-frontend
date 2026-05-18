import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Avatar, Card, PrimaryButton, Screen, SecondaryButton, SectionTitle } from '../components/ui';
import { BLUE, INK, LINE, MUTED, friends } from '../data/yetiData';

export function FriendsScreen({ goTo }) {
  const [addVisible, setAddVisible] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen title="친구" right={<Pressable onPress={() => setAddVisible(true)}><Text style={styles.addIcon}>♧</Text></Pressable>}>
        <View style={styles.searchBox}>
          <Text style={styles.searchText}>⌕ 닉네임으로 친구 찾기</Text>
          <Text style={styles.qrBadge}>QR</Text>
        </View>
        <SectionTitle right="모두 보기 ›">받은 요청 <Text style={styles.countBadge}>2</Text></SectionTitle>
        {[
          ['오민진', '@minjin · 친구 12명 함께'],
          ['윤서연', '@yunseo · 박수아와 함께'],
        ].map(([name, meta], index) => (
          <Card key={name} style={styles.request}>
            <Avatar label={name[0]} color={index ? '#06b6d4' : '#c026d3'} />
            <View style={styles.text}>
              <Text style={styles.name}>{name}</Text>
              <Text numberOfLines={1} style={styles.meta}>{meta}</Text>
            </View>
            <SecondaryButton style={styles.smallButton}>거절</SecondaryButton>
            <PrimaryButton style={styles.smallButton}>수락</PrimaryButton>
          </Card>
        ))}
        <SectionTitle right="이름순⌄">친구 8</SectionTitle>
        {friends.map(([name, handle, message], index) => (
          <Pressable key={handle} onPress={() => goTo?.('friendProfile')}>
            <Card style={styles.friend}>
            <Avatar label={name[0]} color={['#a855f7', BLUE, '#0fbf73', '#fb923c', '#f04454'][index % 5]} />
            <View style={styles.text}>
              <Text style={styles.name}>{name} <Text style={styles.handle}>{handle}</Text></Text>
              <Text style={styles.meta}>{message}</Text>
            </View>
            <Text style={styles.chatCircle}>⌕</Text>
            </Card>
          </Pressable>
        ))}
      </Screen>
      <FriendAddSheet visible={addVisible} onClose={() => setAddVisible(false)} />
    </View>
  );
}

function FriendAddSheet({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handleBar} />
          <Text style={styles.sheetTitle}>친구 추가</Text>
          <Text style={styles.sheetSub}>닉네임으로 검색하거나 내 QR을 공유하세요.</Text>
          <TextInput value="@jiwon" editable={false} style={styles.addInput} />
          <Card style={styles.resultCard}>
            <Avatar label="원" color={BLUE} />
            <View style={styles.text}>
              <Text style={styles.name}>한지원</Text>
              <Text style={styles.meta}>@jiwon · 친구 5명 함께</Text>
            </View>
            <PrimaryButton style={styles.requestButton}>친구 요청</PrimaryButton>
          </Card>
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>또는</Text>
            <View style={styles.divider} />
          </View>
          <View style={styles.qrCard}>
            <View style={styles.qrFake}>
              <Text style={styles.qrText}>▣▣{'\n'}▣□{'\n'}□▣</Text>
            </View>
            <View>
              <Text style={styles.meta}>내 QR</Text>
              <Text style={styles.name}>유진 <Text style={styles.handle}>@yujin</Text></Text>
              <SecondaryButton style={styles.shareButton}>QR 공유</SecondaryButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  addIcon: {
    color: INK,
    fontSize: 22,
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
  request: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    padding: 12,
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
    flex: 0,
    height: 34,
    paddingHorizontal: 11,
  },
  chatCircle: {
    backgroundColor: '#e8f1ff',
    borderRadius: 14,
    color: BLUE,
    fontSize: 13,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 7,
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
    padding: 18,
    paddingBottom: 30,
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
