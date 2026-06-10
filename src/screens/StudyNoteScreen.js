import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, MUTED } from '../data/yetiData';

function splitUrls(value) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function StudyNoteScreen({ apiError, goBack, notes, onCreateNote, onSummarizeNote, schedule }) {
  const [content, setContent] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const scheduleId = schedule?.scheduleId || schedule?.id;

  const submit = async () => {
    if (!scheduleId) {
      setMessage('연결할 일정이 없습니다.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      await onCreateNote?.({
        scheduleId,
        content: content.trim(),
        imageUrls: splitUrls(imageUrls),
      });
      setContent('');
      setImageUrls('');
      setMessage('학습 노트를 저장했습니다.');
    } catch (error) {
      setMessage(error.message || '학습 노트 저장에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const summarize = async (noteId) => {
    setBusy(true);
    setMessage('');
    try {
      await onSummarizeNote?.(noteId);
      setMessage('AI 요약을 생성했습니다.');
    } catch (error) {
      setMessage(error.message || 'AI 요약에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen left="‹" onBack={goBack} title="학습 노트">
      <View style={styles.linked}>
        <Pill>일정</Pill>
        <View style={styles.flex}>
          <Text style={styles.linkTitle}>{schedule?.title || '선택된 일정 없음'}</Text>
          <Text style={styles.linkMeta}>{schedule?.startAt ? formatDate(schedule.startAt) : '일정 상세에서 열어주세요.'}</Text>
        </View>
      </View>

      {message || apiError ? <Text style={styles.message}>{message || apiError}</Text> : null}

      <View style={styles.noteGrid}>
        <Card style={styles.editorCard}>
          <Text style={styles.fieldLabel}>내용</Text>
          <TextInput
            multiline
            onChangeText={setContent}
            placeholder="학습 내용, 느낀 점, 복습할 내용을 적어주세요."
            placeholderTextColor="#a0a8b5"
            style={styles.noteInput}
            textAlignVertical="top"
            value={content}
          />
          <Text style={styles.fieldLabel}>이미지 URL</Text>
          <TextInput
            autoCapitalize="none"
            onChangeText={setImageUrls}
            placeholder="여러 개면 쉼표로 구분"
            placeholderTextColor="#a0a8b5"
            style={styles.urlInput}
            value={imageUrls}
          />
          <PrimaryButton onPress={submit}>{busy ? '저장 중...' : '노트 저장'}</PrimaryButton>
        </Card>

        <View style={styles.noteList}>
          <Text style={styles.section}>저장된 노트 {notes?.length || 0}</Text>
          {(notes || []).length ? notes.map((note) => (
            <Card key={note.id}>
              <View style={styles.noteHeader}>
                <Text style={styles.noteDate}>{formatDate(note.createdAt)}</Text>
                <Pressable onPress={() => summarize(note.id)}>
                  <Text style={styles.summaryAction}>AI 요약</Text>
                </Pressable>
              </View>
              <Text style={styles.noteBody}>{note.content || '내용 없음'}</Text>
              {note.aiSummary ? <Text style={styles.aiBox}>요약: {note.aiSummary}</Text> : null}
              {note.aiFeedback ? <Text style={styles.aiBox}>피드백: {note.aiFeedback}</Text> : null}
            </Card>
          )) : (
            <Card style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>저장된 학습 노트가 없습니다</Text>
              <Text style={styles.emptyText}>위 입력란에서 이 일정에 연결된 노트를 작성하세요.</Text>
            </Card>
          )}
          <SecondaryButton onPress={goBack}>돌아가기</SecondaryButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  linked: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    padding: 13,
  },
  noteGrid: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 18 : 0,
  },
  editorCard: {
    flex: Platform.OS === 'web' ? 1.1 : undefined,
    minWidth: Platform.OS === 'web' ? 420 : undefined,
  },
  noteList: {
    flex: 1,
    minWidth: Platform.OS === 'web' ? 360 : undefined,
  },
  linkTitle: { color: INK, fontSize: 14, fontWeight: '900' },
  linkMeta: { color: MUTED, fontSize: 12, fontWeight: '700', marginTop: 3 },
  message: { color: BLUE, fontSize: 12, fontWeight: '800', marginBottom: 10 },
  fieldLabel: { color: MUTED, fontSize: 11, fontWeight: '900', marginBottom: 8 },
  noteInput: {
    borderColor: '#d9e0ea',
    borderRadius: 10,
    borderWidth: 1,
    color: INK,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 14,
    minHeight: 128,
    padding: 12,
  },
  urlInput: {
    borderColor: '#d9e0ea',
    borderRadius: 10,
    borderWidth: 1,
    color: INK,
    fontSize: 14,
    fontWeight: '700',
    height: 44,
    marginBottom: 14,
    paddingHorizontal: 12,
  },
  section: { color: MUTED, fontSize: 12, fontWeight: '900', marginBottom: 10, marginTop: 8 },
  noteHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  noteDate: { color: MUTED, fontSize: 11, fontWeight: '800' },
  summaryAction: { color: BLUE, fontSize: 12, fontWeight: '900' },
  noteBody: { color: '#475467', fontSize: 13, fontWeight: '700', lineHeight: 21 },
  aiBox: {
    backgroundColor: '#e8f1ff',
    borderRadius: 10,
    color: '#344054',
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 19,
    marginTop: 10,
    padding: 11,
  },
  emptyCard: { alignItems: 'center', paddingVertical: 22 },
  emptyTitle: { color: INK, fontSize: 15, fontWeight: '900' },
  emptyText: { color: MUTED, fontSize: 12, fontWeight: '700', lineHeight: 18, marginTop: 6, textAlign: 'center' },
});
