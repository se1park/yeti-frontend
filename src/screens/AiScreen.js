import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { MessageCircle, UsersRound } from 'lucide-react-native';
import { Avatar, Card, Pill, PrimaryButton, Screen, SecondaryButton, ToggleRow } from '../components/ui';
import { BLUE, INK, LINE, MUTED, quickPrompts } from '../data/yetiData';

function formatDateTime(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}월 ${date.getDate()}일 · ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function formatTime(value) {
  if (!value) return '--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 5);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function getRecurrenceLabel(result) {
  if (result?.recurrenceLabel) return result.recurrenceLabel;
  const byDay = String(result?.recurrenceRule || '').match(/BYDAY=([^;]+)/)?.[1];
  const labels = { SU: '일요일', MO: '월요일', TU: '화요일', WE: '수요일', TH: '목요일', FR: '금요일', SA: '토요일' };
  if (byDay && labels[byDay]) return `매주 ${labels[byDay]}`;
  return result?.recurring ? '매주 반복' : '';
}

function formatScheduleDateLine(result) {
  const recurrenceLabel = getRecurrenceLabel(result);
  if (recurrenceLabel) {
    return `${recurrenceLabel} · ${formatTime(result.startAt)} - ${formatTime(result.endAt)}`;
  }
  return `${formatDateTime(result.startAt)} - ${formatDateTime(result.endAt)}`;
}

function getParticipantLabel(participant) {
  if (typeof participant === 'string') return participant.replace(/^@/, '');
  return participant?.nickname || participant?.username || participant?.handle?.replace(/^@/, '') || '';
}

function formatParticipantText(participants) {
  const names = Array.isArray(participants)
    ? participants.map(getParticipantLabel).filter(Boolean)
    : [];
  return names.length ? `, ${names.join(', ')}` : '';
}

function getMentionState(value, cursor) {
  const beforeCursor = value.slice(0, cursor);
  const match = beforeCursor.match(/(^|\s)@([A-Za-z0-9_.-]*)$/);
  if (!match) return null;

  return {
    query: match[2].toLowerCase(),
    start: beforeCursor.length - match[2].length - 1,
  };
}

function normalizeFriend(friend, index) {
  const username = friend?.username || friend?.handle || '';
  const nickname = friend?.nickname || friend?.name || username || '친구';

  return {
    id: friend?.friendshipId || friend?.userId || username || `${index}`,
    initial: (nickname || username || '?').slice(0, 1).toUpperCase(),
    nickname,
    statusMessage: friend?.statusMessage || '',
    username,
  };
}

export function AiInputScreen({ apiBusy, apiError, friends = [], goTo, goBack, onParse }) {
  const [text, setText] = useState('');
  const [localError, setLocalError] = useState('');
  const [selection, setSelection] = useState({ end: 0, start: 0 });
  const mentionState = getMentionState(text, selection.end);
  const friendSuggestions = mentionState
    ? friends
      .map(normalizeFriend)
      .filter((friend) => friend.username)
      .filter((friend) => {
        if (!mentionState.query) return true;
        return friend.username.toLowerCase().includes(mentionState.query) || friend.nickname.toLowerCase().includes(mentionState.query);
      })
      .slice(0, 6)
    : [];
  const showMentionPicker = Boolean(mentionState);

  const insertMention = (friend) => {
    if (!mentionState || !friend.username) return;
    const mention = `@${friend.username} `;
    const nextText = `${text.slice(0, mentionState.start)}${mention}${text.slice(selection.end)}`;
    const nextCursor = mentionState.start + mention.length;
    setText(nextText);
    setSelection({ end: nextCursor, start: nextCursor });
  };

  const submit = async () => {
    if (!text.trim()) {
      setLocalError('일정 내용을 입력해주세요.');
      return;
    }

    setLocalError('');
    try {
      if (onParse) {
        await onParse(text.trim());
      } else {
        goTo('aiReview');
      }
    } catch (error) {
      setLocalError(error.message || 'AI 일정 정리에 실패했습니다.');
    }
  };

  return (
    <Screen
      left="×"
      onBack={goBack}
      title={'무엇을\n함께 잡을까요?'}
      subtitle="편하게 말하듯 적어주세요. AI가 정리해드릴게요."
      bottom={<PrimaryButton onPress={submit}>{apiBusy ? '정리 중...' : '정리하기'}</PrimaryButton>}
    >
      <TextInput
        multiline
        onChangeText={setText}
        onSelectionChange={(event) => setSelection(event.nativeEvent.selection)}
        selection={selection}
        value={text}
        placeholder="예) 내일 오후 2시 지민이랑 강남에서 회의"
        placeholderTextColor="#c6ccd7"
        style={styles.input}
        textAlignVertical="top"
      />
      {showMentionPicker ? (
        <Card style={styles.mentionCard}>
          <Text style={styles.mentionTitle}>친구 선택</Text>
          {friendSuggestions.length ? friendSuggestions.map((friend) => (
            <Pressable key={friend.id} onPress={() => insertMention(friend)} style={({ pressed }) => [styles.mentionRow, pressed && styles.mentionPressed]}>
              <Avatar label={friend.initial} size={34} />
              <View style={styles.mentionText}>
                <Text numberOfLines={1} style={styles.mentionName}>{friend.nickname}</Text>
                <Text numberOfLines={1} style={styles.mentionUsername}>@{friend.username}</Text>
              </View>
              <Text style={styles.mentionAdd}>추가</Text>
            </Pressable>
          )) : (
            <Text style={styles.mentionEmpty}>검색된 친구가 없습니다.</Text>
          )}
        </Card>
      ) : null}
      {localError || apiError ? <Text style={styles.errorText}>{localError || apiError}</Text> : null}
      <Text style={styles.promptTitle}>이렇게 적으면 좋아요</Text>
      <View style={styles.promptWrap}>
        {quickPrompts.map((prompt) => (
          <Pressable key={prompt} onPress={() => {
            setText(prompt);
            setSelection({ end: prompt.length, start: prompt.length });
          }}>
            <Text style={styles.prompt}>{prompt}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

export function AiReviewScreen({ apiBusy, apiError, goTo, goBack, onCreate, parsedSchedule }) {
  const [doneVisible, setDoneVisible] = useState(false);
  const [localError, setLocalError] = useState('');
  const result = parsedSchedule;
  const confidence = result
    ? Math.round((result.aiConfidence > 1 ? result.aiConfidence : result.aiConfidence * 100) || 96)
    : 0;
  const participantText = formatParticipantText(result?.participants);

  const submit = async () => {
    setLocalError('');
    try {
      await onCreate?.();
      setDoneVisible(true);
    } catch (error) {
      setLocalError(error.message || '일정 등록에 실패했습니다.');
    }
  };

  return (
    <View style={styles.flex}>
      <Screen
        left="×"
        onBack={goBack}
        right={result ? <Text style={styles.confidence}>✦ 신뢰도 {confidence}%</Text> : null}
        bottom={result ? (
          <View style={styles.bottomButtons}>
            <SecondaryButton>수정</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={submit}>{apiBusy ? '등록 중...' : '일정 등록하기'}</PrimaryButton>
          </View>
        ) : null}
      >
        {result ? (
          <>
            <View style={styles.typedBox}>
              <Text style={styles.typedText}><Text style={styles.blue}>{result.title}</Text> 일정이 정리됐어요.</Text>
            </View>
            {localError || apiError ? <Text style={styles.errorText}>{localError || apiError}</Text> : null}
            {result.clarificationRequired ? (
              <Text style={styles.warningText}>AI가 일부 내용을 확신하지 못했어요. 등록 전에 일정 정보를 확인해주세요.</Text>
            ) : null}
            <Text style={styles.aiLabel}>✦ AI가 정리한 일정</Text>
            <Card style={styles.resultCard}>
              <Pill>{result.category || '일정'}</Pill>
              <Text style={styles.resultTitle}>{result.title || '제목 없는 일정'}</Text>
              <Text style={styles.resultLine}>◷  일시   {formatScheduleDateLine(result)}</Text>
              <Text style={styles.resultLine}>⌖  장소   {result.location || '-'}</Text>
              <View style={styles.resultLineWithIcon}>
                <UsersRound color={MUTED} size={15} strokeWidth={2.3} />
                <Text style={styles.resultLine}>참여   나{participantText} <Text style={styles.invite}>초대 전송 예정</Text></Text>
              </View>
            </Card>
            <Card style={styles.toggleCard}>
              <ToggleRow label="채팅방 자동 생성" enabled />
              <ToggleRow label="15분 전 알림" enabled />
              <ToggleRow label="매주 반복" enabled={Boolean(result.recurring || result.recurrenceRule)} />
            </Card>
          </>
        ) : (
          <Card style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>정리된 일정이 없습니다</Text>
            <Text style={styles.emptyText}>AI 입력 화면에서 내용을 입력하면 백엔드 파싱 결과가 여기에 표시돼요.</Text>
          </Card>
        )}
      </Screen>
      <DoneSheet
        result={result}
        visible={doneVisible}
        onClose={() => {
          setDoneVisible(false);
          goTo('home');
        }}
        onChat={() => {
          setDoneVisible(false);
          goTo('chatRoom');
        }}
      />
    </View>
  );
}

function DoneSheet({ result, visible, onClose, onChat }) {
  if (!visible) return null;

  return (
    <>
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.sheetTitle}>일정을 등록했어요</Text>
          <Text style={styles.sheetSub}>백엔드에 일정이 저장되었습니다.</Text>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>▣</Text>
            <View style={styles.summaryText}>
              <Text style={styles.summaryTitle}>{result?.title || '등록된 일정'}</Text>
              <Text style={styles.summaryMeta}>{formatScheduleDateLine(result)} · {result?.location || '-'}</Text>
            </View>
          </View>
          <View style={styles.bottomButtons}>
            <SecondaryButton onPress={onClose}>닫기</SecondaryButton>
            <PrimaryButton style={styles.primaryGrow} onPress={onChat}>
              <View style={styles.buttonLabel}>
                <MessageCircle color="#ffffff" size={15} strokeWidth={2.4} />
                <Text style={styles.buttonLabelText}>채팅방 열기</Text>
              </View>
            </PrimaryButton>
          </View>
        </View>
      </View>
    </>
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
  errorText: {
    color: '#f04454',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 10,
  },
  warningText: {
    backgroundColor: '#fff7e6',
    borderRadius: 10,
    color: '#b54708',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 18,
    marginTop: 10,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  mentionCard: {
    borderColor: '#d8e6ff',
    marginBottom: 0,
    marginTop: 10,
    padding: 10,
  },
  mentionTitle: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  mentionRow: {
    alignItems: 'center',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 8,
    paddingVertical: 7,
  },
  mentionPressed: {
    backgroundColor: '#eef5ff',
  },
  mentionText: {
    flex: 1,
  },
  mentionName: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  mentionUsername: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
    marginTop: 2,
  },
  mentionAdd: {
    color: BLUE,
    fontSize: 12,
    fontWeight: '900',
  },
  mentionEmpty: {
    color: MUTED,
    fontSize: 12,
    fontWeight: '800',
    padding: 10,
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
  resultLineWithIcon: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
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
  buttonLabel: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  buttonLabelText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  primaryGrow: {
    flex: 1.55,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
    bottom: 0,
    justifyContent: 'flex-end',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxWidth: 430,
    padding: 22,
    paddingBottom: 30,
    width: '100%',
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
});
