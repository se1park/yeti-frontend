import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Pill, PrimaryButton, Screen, SecondaryButton, ToggleRow } from '../components/ui';
import { BLUE, INK, LINE, MUTED, quickPrompts } from '../data/yetiData';

export function AiInputScreen({ goTo, goBack }) {
  const [text, setText] = useState('');

  return (
    <Screen
      left="×"
      onBack={goBack}
      title={'무엇을\n함께 잡을까요?'}
      subtitle="편하게 말하듯 적어주세요. AI가 정리해드릴게요."
      bottom={<PrimaryButton onPress={() => goTo('aiReview')}>정리하기</PrimaryButton>}
    >
      <TextInput
        multiline
        value={text}
        onChangeText={setText}
        placeholder="예) 내일 오후 2시 지민이랑 강남에서 회의"
        placeholderTextColor="#c6ccd7"
        style={styles.input}
        textAlignVertical="top"
      />
      <Text style={styles.promptTitle}>이렇게 적으면 좋아요</Text>
      <View style={styles.promptWrap}>
        {quickPrompts.map((prompt) => (
          <Pressable key={prompt} onPress={() => setText(prompt)}>
            <Text style={styles.prompt}>{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

export function AiReviewScreen({ goTo, goBack }) {
  const [doneVisible, setDoneVisible] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen
        left="×"
        onBack={goBack}
        right={<Text style={styles.confidence}>✦ 신뢰도 96%</Text>}
        bottom={(
          <View style={styles.bottomButtons}>
            <SecondaryButton>수정</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={() => setDoneVisible(true)}>일정 등록하기</PrimaryButton>
          </View>
        )}
      >
        <View style={styles.typedBox}>
          <Text style={styles.typedText}><Text style={styles.blue}>내일 오후 2시</Text>에 <Text style={styles.blue}>@지민</Text>이랑 <Text style={styles.blue}>강남</Text>에서 회의</Text>
        </View>
        <Text style={styles.aiLabel}>✦ AI가 정리한 일정</Text>
        <Card style={styles.resultCard}>
          <Pill>업무</Pill>
          <Text style={styles.resultTitle}>지민이와 회의</Text>
          <Text style={styles.resultLine}>◷  일시   5월 19일 (화) · 오후 2:00 - 3:00</Text>
          <Text style={styles.resultLine}>⌖  장소   강남</Text>
          <Text style={styles.resultLine}>♧  참여   나, 김지민 <Text style={styles.invite}>초대 전송 예정</Text></Text>
        </Card>
        <Card style={styles.toggleCard}>
          <ToggleRow label="채팅방 자동 생성" enabled />
          <ToggleRow label="15분 전 알림" enabled />
          <ToggleRow label="매주 반복" />
        </Card>
      </Screen>
      <DoneSheet
        visible={doneVisible}
        onClose={() => setDoneVisible(false)}
        onChat={() => {
          setDoneVisible(false);
          goTo('chatRoom');
        }}
      />
    </View>
  );
}

function DoneSheet({ visible, onClose, onChat }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.sheetTitle}>일정을 등록했어요</Text>
          <Text style={styles.sheetSub}>김지민님께 초대 알림이 전송됐어요.</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>▣</Text>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>지민이와 회의</Text>
              <Text style={styles.summaryMeta}>5월 19일(화) · 오후 2:00 · 강남</Text>
            </View>
          </View>
          <View style={styles.bottomButtons}>
            <SecondaryButton onPress={onClose}>닫기</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={onChat}>⌕ 채팅방 열기</PrimaryButton>
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
  input: {
    borderColor: BLUE,
    borderRadius: 10,
    borderWidth: 1.5,
    color: INK,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    minHeight: 118,
    padding: 14,
  },
  promptTitle: {
    color: '#9aa4b5',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 16,
  },
  promptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
  },
  prompt: {
    backgroundColor: '#f0f2f5',
    borderRadius: 16,
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  confidence: {
    backgroundColor: '#e8f1ff',
    borderRadius: 14,
    color: BLUE,
    fontSize: 11,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  typedBox: {
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    marginTop: 8,
    padding: 15,
  },
  typedText: {
    color: INK,
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 22,
  },
  blue: {
    color: BLUE,
  },
  aiLabel: {
    color: '#7f8da3',
    fontSize: 11,
    fontWeight: '900',
    marginVertical: 12,
  },
  resultCard: {
    marginBottom: 12,
  },
  resultTitle: {
    color: INK,
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 10,
  },
  resultLine: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 25,
  },
  invite: {
    backgroundColor: '#e8f1ff',
    color: BLUE,
    fontSize: 10,
  },
  toggleCard: {
    paddingVertical: 0,
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryGrow: {
    flex: 1.55,
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
  checkCircle: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#e8f1ff',
    borderRadius: 28,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  check: {
    color: BLUE,
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
  summaryCard: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
    padding: 13,
  },
  summaryIcon: {
    color: BLUE,
    fontSize: 20,
    fontWeight: '900',
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  summaryMeta: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
});
