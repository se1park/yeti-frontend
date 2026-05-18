import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Card, Pill, PrimaryButton, Screen, SecondaryButton } from '../components/ui';
import { BLUE, INK, LINE, MUTED } from '../data/yetiData';

export function StudyNoteScreen({ goBack }) {
  const [summaryVisible, setSummaryVisible] = useState(false);

  return (
    <View style={styles.flex}>
      <Screen left="‹" onBack={goBack} title="학습 노트" right="저장">
        <View style={styles.linked}>
          <Text style={styles.linkIcon}>□</Text>
          <View style={styles.flex}>
            <Text style={styles.linkMeta}>연결된 학습</Text>
            <Text style={styles.linkTitle}>영어 회화 스터디 · 5월 18일 (월) · 카페 라운지</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </View>
        <Text style={styles.title}>주간 모의고사 오답 정리</Text>
        <Text style={styles.section}>핵심 어휘</Text>
        <Text style={styles.body}>•  vivid — 생생한, 강렬한 인상의{'\n'}•  robust — 튼튼한, 견고한{'\n'}•  ambiguous — 모호한, 두 가지로 해석되는</Text>
        <Text style={styles.section}>다시 봐야할 것</Text>
        <Text style={styles.body}>1. 가정법 과거완료 시제 — 본동사 had p.p. 매번 헷갈림{'\n\n'}2. 관계대명사 that vs which</Text>
        <View style={styles.attachRow}>
          <View style={styles.attachment}>
            <Text style={styles.attachName}>오답 노트.png</Text>
            <Text style={styles.attachIcon}>▧</Text>
          </View>
          <View style={styles.addPhoto}>
            <Text style={styles.plus}>＋</Text>
            <Text style={styles.addPhotoText}>사진 추가</Text>
          </View>
        </View>
        <Pressable onPress={() => setSummaryVisible(true)} style={styles.aiCard}>
          <Pill>✦</Pill>
          <View style={styles.flex}>
            <Text style={styles.aiTitle}>AI가 3줄로 요약해드릴까요?</Text>
            <Text style={styles.aiSub}>학습 내용 핵심만 골라드릴게요.</Text>
          </View>
          <Text style={styles.proBadge}>PRO</Text>
          <Text style={styles.summaryButton}>요약</Text>
        </Pressable>
      </Screen>
      <SummarySheet visible={summaryVisible} onClose={() => setSummaryVisible(false)} />
    </View>
  );
}

function SummarySheet({ visible, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="slide">
      <View style={styles.modalBackdrop}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Pill>✦</Pill>
            <Text style={styles.sheetTitle}>AI 3줄 요약</Text>
            <Text style={styles.proBadgeDark}>PRO</Text>
          </View>
          <View style={styles.summaryBox}>
            {[
              '오답이 가장 많이 나온 영역은 가정법 과거 완료. 시제를 정확히 구분하지 못함.',
              '핵심 어휘 3개(vivid, robust, ambiguous)는 다양한 문맥에서 다시 출제될 가능성 높음.',
              '관계대명사 that vs which 구분은 다음 회차 학습 전 복습 권장.',
            ].map((line, index) => (
              <View key={line} style={styles.summaryLine}>
                <Text style={styles.summaryIndex}>{index + 1}</Text>
                <Text style={styles.summaryText}>{line}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.savedText}>요약은 노트 하단에 자동 저장됐어요.</Text>
          <View style={styles.sheetButtons}>
            <SecondaryButton onPress={onClose}>다시 요약</SecondaryButton>
            <PrimaryButton style={styles.flexGrow} onPress={onClose}>노트에 적용</PrimaryButton>
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
  linked: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
    padding: 13,
  },
  linkIcon: {
    color: '#d946ef',
    fontSize: 18,
    fontWeight: '900',
  },
  linkMeta: {
    color: MUTED,
    fontSize: 10,
    fontWeight: '900',
  },
  linkTitle: {
    color: INK,
    fontSize: 12,
    fontWeight: '900',
    marginTop: 3,
  },
  chevron: {
    color: MUTED,
    fontSize: 20,
  },
  title: {
    color: INK,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 32,
    marginBottom: 16,
  },
  section: {
    color: INK,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 4,
  },
  body: {
    color: '#475467',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 25,
    marginBottom: 14,
  },
  attachRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },
  attachment: {
    backgroundColor: '#dff7fb',
    borderRadius: 10,
    flex: 1,
    height: 88,
    justifyContent: 'space-between',
    padding: 11,
  },
  attachName: {
    color: '#475467',
    fontSize: 10,
    fontWeight: '900',
  },
  attachIcon: {
    color: BLUE,
    fontSize: 24,
    textAlign: 'center',
  },
  addPhoto: {
    alignItems: 'center',
    backgroundColor: '#f4f6f8',
    borderColor: LINE,
    borderRadius: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    flex: 1,
    height: 88,
    justifyContent: 'center',
  },
  plus: {
    color: MUTED,
    fontSize: 24,
  },
  addPhotoText: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 4,
  },
  aiCard: {
    alignItems: 'center',
    backgroundColor: '#e8f1ff',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  aiTitle: {
    color: INK,
    fontSize: 14,
    fontWeight: '900',
  },
  aiSub: {
    color: MUTED,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  proBadge: {
    backgroundColor: INK,
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  summaryButton: {
    backgroundColor: BLUE,
    borderRadius: 9,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 10,
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
  handle: {
    alignSelf: 'center',
    backgroundColor: '#d0d5dd',
    borderRadius: 2,
    height: 4,
    marginBottom: 14,
    width: 34,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  sheetTitle: {
    color: INK,
    fontSize: 18,
    fontWeight: '900',
  },
  proBadgeDark: {
    backgroundColor: INK,
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 8,
    fontWeight: '900',
    overflow: 'hidden',
    paddingHorizontal: 5,
    paddingVertical: 3,
  },
  summaryBox: {
    backgroundColor: '#e8f1ff',
    borderRadius: 12,
    padding: 13,
  },
  summaryLine: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  summaryIndex: {
    backgroundColor: BLUE,
    borderRadius: 6,
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    height: 22,
    lineHeight: 22,
    overflow: 'hidden',
    textAlign: 'center',
    width: 22,
  },
  summaryText: {
    color: '#344054',
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    lineHeight: 19,
  },
  savedText: {
    backgroundColor: '#f4f6f8',
    borderRadius: 8,
    color: MUTED,
    fontSize: 12,
    fontWeight: '700',
    marginVertical: 12,
    padding: 11,
  },
  sheetButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  flexGrow: {
    flex: 1.4,
  },
});
